import Stripe from "stripe";
import sql from "mssql";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// SQL Konfiguráció
const sqlConfig = {
    user: process.env.AZURE_SQL_USER,
    password: process.env.AZURE_SQL_PASSWORD,
    database: process.env.AZURE_SQL_DATABASE,
    server: process.env.AZURE_SQL_SERVER,
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: { encrypt: true, trustServerCertificate: false }
};

export default async function handler(req, res) {
  // Megelőzzük a crash-t, ha nincs body
  const { sessionId, vipToken } = req.body || {};

  // 1. MASTER/VIP - AZONNALI BELÉPÉS
  // Megtartottuk az eredeti logikát: Master kód és a megadott VIP tokenek
  const masterCode = "MASTER-DOMINANCE-2026"; 
  const vipCodes = ["WAI-GUEST-7725", "WAI-CLIENT-8832", "WAI-PARTER-9943"];

  if (vipToken === masterCode || vipCodes.includes(vipToken)) {
    return res.status(200).json({ valid: true, active: true, success: true });
  }

  // --- EMLÉKEZTETŐ: A két további kód helye ---
  // Itt ellenőrizheted majd azt a két extra kódot, amit említettél [2026-02-17]
  // if (vipToken === "EXTRA-KOD-1") ...

  // 2. SQL ÉS STRIPE ELLENŐRZÉS
  // Ha van sessionId (cs_...), akkor az adatbázisból nézzük meg a valós állapotot
  if (sessionId && sessionId.startsWith("cs_")) {
    try {
      let pool = await sql.connect(sqlConfig);
      
      const result = await pool.request()
        .input('code', sql.NVarChar, sessionId)
        .query('SELECT * FROM subscriptions WHERE stripe_session_id = @code');

      const subscription = result.recordset[0];

      if (subscription) {
        const now = new Date();
        // Ellenőrizzük, hogy aktív-e még (időben nem járt le)
        const isNotExpired = now < new Date(subscription.expires_at);
        
        return res.status(200).json({ 
          valid: isNotExpired, 
          active: isNotExpired, 
          success: isNotExpired 
        });
      }

      // FALLBACK: Ha az SQL-ben valamiért még nincs benne, de a Stripe-nál igen
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const isPaid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
      
      return res.status(200).json({ valid: isPaid, active: isPaid, success: isPaid });

    } catch (e) {
      // Ha az SQL vagy a Stripe API hibát dob, megmarad a te "biztonsági hálód":
      // NE dobjuk ki a felhasználót, ha már eljutott idáig a session ID-val!
      console.error("Database/Stripe error, granting emergency access");
      return res.status(200).json({ valid: true, active: true, success: true });
    }
  }

  // 3. VÉGSŐ MENTŐÖV
  // Ha van valami a LocalStorage-ban (vipToken), továbbra is esélyt adunk neki
  if (vipToken) {
     return res.status(200).json({ valid: true, active: true });
  }

  // Csak akkor dobjuk ki, ha tényleg semmije nincs
  return res.status(200).json({ valid: false, active: false });
}
