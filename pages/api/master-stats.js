import sgMail from '@sendgrid/mail';

export default async function handler(req, res) {
  // BIZTONSÁG: Token ellenőrzés
  const masterToken = req.headers['x-master-token'];
  if (masterToken !== "MASTER-DOMINANCE-2026") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // 1. STRIPE ADATOK
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const balance = await stripe.balance.retrieve();
    const amount = balance.available[0].amount / 100;
    const currency = balance.available[0].currency.toUpperCase();

    // 2. SENDGRID STATISZTIKA (Dinamikus dátummal)
    let sendgridStats = { status: "OFFLINE", sentToday: 0 };
    
    if (process.env.SENDGRID_API_KEY) {
      // Mai dátum lekérése YYYY-MM-DD formátumban
      const today = new Date().toISOString().split('T')[0];
      
      const sgResponse = await fetch(`https://api.sendgrid.com/v3/stats?start_date=${today}`, {
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (sgResponse.ok) {
        const statsData = await sgResponse.json();
        // Összegezzük a mai napon kézbesített leveleket
        const totalDelivered = statsData.reduce((acc, curr) => {
          const dailyTotal = curr.stats.reduce((sAcc, sCurr) => sAcc + (sCurr.metrics.delivered || 0), 0);
          return acc + dailyTotal;
        }, 0);
        
        sendgridStats = {
          status: "ACTIVE",
          sentToday: totalDelivered,
          limitRemaining: Math.max(0, 100 - totalDelivered) 
        };
      }
    }

    // VÁLASZ ADÁSA
    res.status(200).json({
      stripe: `${amount} ${currency}`,
      sendgrid: sendgridStats,
      serverTime: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
