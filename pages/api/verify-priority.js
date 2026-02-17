import { connectToDatabase } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { session_id } = req.body;

  // 1. AZ EREDETI FIX KÓDOK (VISSZAÁLLÍTVA)
  const masterCode = "WAI-MASTER-2026-X"; 
  const vipCodes = ["WAI-VIP-01", "WAI-VIP-02", "WAI-VIP-03"];

  if (session_id === masterCode || vipCodes.includes(session_id)) {
    return res.status(200).json({ 
      valid: true, 
      message: "Eredeti VIP hozzáférés engedélyezve." 
    });
  }

  // 2. ADATBÁZIS ELLENŐRZÉS (A Stripe vásárlóknak)
  try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .input("sessionId", session_id)
      .query("SELECT * FROM subscriptions WHERE stripe_session_id = @sessionId");

    if (result.recordset.length > 0) {
      return res.status(200).json({ valid: true });
    } else {
      return res.status(404).json({ valid: false, message: "Érvénytelen kód." });
    }
  } catch (error) {
    console.error("SQL hiba:", error);
    return res.status(500).json({ message: "Szerver hiba az ellenőrzéskor." });
  }
}
