import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const masterToken = req.headers['x-master-token'];
  if (masterToken !== "MASTER-DOMINANCE-2026") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const balance = await stripe.balance.retrieve();
    const amount = balance.available[0].amount / 100;
    const currency = balance.available[0].currency.toUpperCase();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL, 
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Összes látogató
    const { count: totalCount } = await supabase
      .from('visitations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());

    // VALÓDI EMBEREK (Kiszűrjük a gyakori bot kulcsszavakat)
    const { count: humanCount } = await supabase
      .from('visitations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())
      .not('user_agent', 'ilike', '%bot%')
      .not('user_agent', 'ilike', '%crawler%')
      .not('user_agent', 'ilike', '%vercel%')
      .not('user_agent', 'ilike', '%python%');

    const sendGridActive = !!process.env.SENDGRID_API_KEY;

    res.status(200).json({
      stripe: `${amount} ${currency}`,
      trafficToday: totalCount || 0,
      humansToday: humanCount || 0, // <--- ÚJ ADAT
      sendgrid: sendGridActive ? "ACTIVE" : "OFFLINE",
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error("Master Stats Error:", error);
    res.status(500).json({ error: error.message });
  }
}
