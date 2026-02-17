import { connectToDatabase } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") 
    return res.status(405).json({ message: "Method not allowed" });

  const { vipCode } = req.body;

  if (!vipCode) {
    return res.status(400).json({ valid: false });
  }

  // 1. FIX MASTER + VIP KÓDOK
  const masterCode = "MASTER-DOMINANCE-2026"; 
  const vipCodes = ["WAI-GUEST-7725", "WAI-CLIENT-8832", "WAI-PARTER-9943"];

  if (vipCode === masterCode || vipCodes.includes(vipCode)) {
    return res.status(200).json({ 
      valid: true, 
      active: true,
      redirectPath: "/premium/hub"
    });
  }

  // 2. STRIPE SESSION ID CHECK (ha cs_ kezdetű)
  if (vipCode.startsWith("cs_")) {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input("sessionId", vipCode)
        .query("SELECT * FROM subscriptions WHERE stripe_session_id = @sessionId");

      if (result.recordset.length > 0) {
        return res.status(200).json({ valid: true, active: true });
      } else {
        return res.status(401).json({ valid: false });
      }
    } catch (error) {
      console.error("SQL hiba:", error);
      return res.status(500).json({ valid: false });
    }
  }

  return res.status(401).json({ valid: false });
}
