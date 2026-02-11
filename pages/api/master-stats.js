// pages/api/master-stats.js
export default async function handler(req, res) {
  // BIZTONSÁG: Csak akkor válaszolunk, ha a kérésnél ott a Mester kód
  const masterToken = req.headers['x-master-token'];
  if (masterToken !== "MASTER-DOMINANCE-2026") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // 1. STRIPE ADATOK LEKÉRÉSE
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const balance = await stripe.balance.retrieve();
    const amount = balance.available[0].amount / 100; // Centből Euró/Dollár
    const currency = balance.available[0].currency.toUpperCase();

    // 2. SENDGRID STATISZTIKA (Opcionális, ha be van állítva)
    // Itt egyelőre egy egyszerű "Alive" státuszt küldünk
    const sendGridActive = !!process.env.SENDGRID_API_KEY;

    res.status(200).json({
      stripe: `${amount} ${currency}`,
      sendgrid: sendGridActive ? "ACTIVE" : "OFFLINE",
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
