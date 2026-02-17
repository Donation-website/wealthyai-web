import { connectToDatabase } from "./db";

export async function enterpriseShield(req, endpoint, limitPerHour = 10) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    "unknown";

  const pool = await connectToDatabase();

  // 1️⃣ CHECK BLOCKED
  const blocked = await pool.request()
    .input("ip", ip)
    .query(`
      SELECT * FROM blocked_ips
      WHERE ip_address = @ip
      AND blocked_until > GETDATE()
    `);

  if (blocked.recordset.length > 0) {
    throw new Error("IP_BLOCKED");
  }

  // 2️⃣ CHECK RATE
  const result = await pool.request()
    .input("ip", ip)
    .input("endpoint", endpoint)
    .query(`
      SELECT COUNT(*) as count FROM rate_limits
      WHERE ip_address = @ip
      AND endpoint = @endpoint
      AND created_at > DATEADD(hour, -1, GETDATE())
    `);

  const count = result.recordset[0].count;

  if (count >= limitPerHour) {
    // AUTO BLOCK 24 HOURS
    await pool.request()
      .input("ip", ip)
      .query(`
        INSERT INTO blocked_ips (ip_address, blocked_until)
        VALUES (@ip, DATEADD(hour, 24, GETDATE()))
      `);

    throw new Error("RATE_LIMIT_EXCEEDED");
  }

  // 3️⃣ LOG REQUEST
  await pool.request()
    .input("ip", ip)
    .input("endpoint", endpoint)
    .query(`
      INSERT INTO rate_limits (ip_address, endpoint)
      VALUES (@ip, @endpoint)
    `);
}
