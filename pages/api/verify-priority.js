import Stripe from "stripe";
import sql from "mssql";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// SQL Konfiguráció - megegyezik a webhooknál használttal
const sqlConfig = {
    user: process.env.AZURE_SQL_USER,
    password: process.env.AZURE_SQL_PASSWORD,
    database: process.env.AZURE_SQL_DATABASE,
    server: process.env.AZURE_SQL_SERVER,
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: { encrypt: true, trustServerCertificate: false }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ valid: false });

  try {
    const { vipCode } = req.body;
    if (!vipCode) return res.status(400).json({ valid: false });
    const trimmedCode = vipCode.trim();

    // 1. MASTER KÓD (Örök hozzáférés neked)
    if (trimmedCode === "MASTER-DOMINANCE-2026") {
      return res.status(200).json({ valid: true, active: true, level: "master", redirectPath: "/premium/hub" });
    }

    // 2. REKLÁM CÉLÚ VIP KÓDOK (Manuális kezelés)
    const activePromoCodes = ["VIP-PROMO-01", "VIP-PROMO-02"]; 
    if (activePromoCodes.includes(trimmedCode)) {
      return res.status(200).json({ valid: true, active: true, level: "paid", redirectPath: "/premium-month" });
    }

    // --- EMMLÉKEZTETŐ: Itt lesz helye a két további speciális kódnak ---
    // KÓD 1: [Ide jön majd az egyik extra kódod]
    // KÓD 2: [Ide jön majd a másik extra kódod]

    // 3. STRIPE / SQL ELLENŐRZÉSE
    if (trimmedCode.startsWith("cs_")) {
      let pool = await sql.connect(sqlConfig);
      
      // Megnézzük, benne van-e már az adatbázisban a kód
      const result = await pool.request()
        .input('code', sql.NVarChar, trimmedCode)
        .query('SELECT * FROM subscriptions WHERE stripe_session_id = @code');

      const subscription = result.recordset[0];

      // HA NINCS AZ SQL-BEN: Akkor biztonsági mentésként lekérjük a Stripe-tól (Fallback)
      if (!subscription) {
        const session = await stripe.checkout.sessions.retrieve(trimmedCode);
        if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
          // Ha a Stripe-nál oké, de nálunk nincs meg, gyorsan adjuk hozzá (ez ritka, de biztonságos)
          return res.status(401).json({ valid: false, message: "System synchronizing. Please try again in 5 seconds." });
        }
      }

      // HA MEGVAN AZ SQL-BEN: Itt dől el a sorsa
      if (subscription) {
        const now = new Date();

        // ELSŐ AKTIVÁLÁS KEZELÉSE (First Activation)
        if (subscription.activated_at === null) {
          await pool.request()
            .input('code', sql.NVarChar, trimmedCode)
            .query('UPDATE subscriptions SET activated_at = GETDATE() WHERE stripe_session_id = @code');
          console.log(`🚀 Első aktiválás rögzítve: ${trimmedCode}`);
        }

        // LEJÁRAT ELLENŐRZÉSE (Most már az SQL-ben tárolt dátum alapján)
        if (now > subscription.expires_at) {
          return res.status(401).json({ 
            valid: false, 
            message: "This access code has expired." 
          });
        }

        // Útvonal meghatározása a mentett Tier alapján
        let path = "/day";
        if (subscription.tier === "week") path = "/premium-week";
        if (subscription.tier === "month" || subscription.tier === "premium") path = "/premium-month";

        return res.status(200).json({ 
          valid: true, 
          active: true, 
          level: "paid", 
          redirectPath: path 
        });
      }
    }

    return res.status(401).json({ valid: false, message: "Invalid or expired code." });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ valid: false });
  }
}
