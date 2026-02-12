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
    const stripeAmount = balance.available[0].amount / 100;
    const currency = balance.available[0].currency.toUpperCase();

    // 2. KUPONKÓDOK FIGYELÉSE
    // Itt a 3 kuponodat tudod listázni. 
    // Ha van adatbázisod, itt kérdezd le a használatukat.
    const activeCoupons = [
      { code: "KUPON1", status: "ACTIVE" },
      { code: "KUPON2", status: "ACTIVE" },
      { code: "KUPON3", status: "USED" } // Példa, ha látni akarod mi fogyott el
    ];

    // 3. SENDGRID STATISZTIKA (Dinamikus dátummal)
    let sendgridStats = { status: "OFFLINE", sentToday: 0 };
    
    if (process.env.SENDGRID_API_KEY) {
      const today = new Date().toISOString().split('T')[0];
      
      const sgResponse = await fetch(`https://api.sendgrid.com/v3/stats?start_date=${today}`, {
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (sgResponse.ok) {
        const statsData = await sgResponse.json();
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

    // ÖSSZESÍTETT VÁLASZ
    res.status(200).json({
      revenue: {
        stripe: `${stripeAmount} ${currency}`,
        activeCoupons: activeCoupons, // Itt látod a 3 kuponod státuszát
        couponCount: activeCoupons.length
      },
      sendgrid: sendgridStats,
      serverTime: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
