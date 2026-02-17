import { connectToDatabase } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") 
    return res.status(405).json({ message: "Method not allowed" });

  const { vipCode } = req.body;

  if (!vipCode) {
    return res.status(400).json({ valid: false });
  }

  const masterCode = "MASTER-DOMINANCE-2026"; 
  const vipCodes = ["WAI-GUEST-7725", "WAI-CLIENT-8832", "WAI-PARTER-9943"];

  if (vipCode === masterCode || vipCodes.includes(vipCode)) {
    return res.status(200).json({ 
      valid: true, 
      active: true,
      redirectPath: "/premium/hub"
    });
  }

  if (vipCode.startsWith("cs_")) {
    try {
      const pool = await connectToDatabase();

      const result = await pool.request()
        .input("sessionId", vipCode)
        .query(`
          SELECT stripe_session_id, expires_at 
          FROM subscriptions 
          WHERE stripe_session_id = @sessionId
        `);

      if (result.recordset.length === 0) {
        return res.status(401).json({ valid: false });
      }

      const record = result.recordset[0];
      const now = new Date();

      if (record.expires_at && new Date(record.expires_at) < now) {
        return res.status(401).json({ valid: false });
      }

      return res.status(200).json({ valid: true, active: true });

    } catch (error) {
      console.error("SQL hiba:", error);
      return res.status(500).json({ valid: false });
    }
  }

  return res.status(401).json({ valid: false });
}
