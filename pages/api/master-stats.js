import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // BIZTONSÁG: Mester kód ellenőrzése
  const masterToken = req.headers['x-master-token'];
  if (masterToken !== "MASTER-DOMINANCE-2026") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // 1. STRIPE ADATOK LEKÉRÉSE
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const balance = await stripe.balance.retrieve();
    const amount = balance.available[0].amount / 100;
    const currency = balance.available[0].currency.toUpperCase();

    // 2. SUPABASE FORGALOM LEKÉRÉSE (Ma éjféltől)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL, 
      process.env.SUPABASE_SERVICE_ROLE_KEY // Fontos: ide a service_role kulcs kell a szervernek!
    );

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count, error: trafficError } = await supabase
      .from('visitations') // JAVÍTVA: site_traffic-ról visitations-re
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());

    // 3. SENDGRID STATISZTIKA
    const sendGridActive = !!process.env.SENDGRID_API_KEY;

    // VÁLASZ KÜLDÉSE
    res.status(200).json({
      stripe: `${amount} ${currency}`,
      trafficToday: count || 0, // <--- Ez az új adat a Dashboardodnak
      sendgrid: sendGridActive ? "ACTIVE" : "OFFLINE",
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error("Master Stats Error:", error);
    res.status(500).json({ error: error.message });
  }
}
