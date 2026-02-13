let stripe;

export default async function handler(req, res) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Missing STRIPE_SECRET_KEY");
    return res.status(200).json({ valid: false });
  }

  stripe = stripe || new (require("stripe"))(process.env.STRIPE_SECRET_KEY);

  if (req.method !== "POST") {
    return res.status(405).json({ valid: false });
  }

  const { sessionId, vipToken } = req.body; // 🆕 Itt fogadjuk a VIP tokent is

  // 1. VIP ELLENŐRZÉS - Ha te vagy az, ne is keressünk Stripe-ot
  if (vipToken === "MASTER-DOMINANCE-2026") {
    return res.status(200).json({ 
      valid: true, 
      plan: 'vip',
      isReturningCustomer: false 
    });
  }

  // 2. STRIPE ELLENŐRZÉS - Csak ha nincs VIP
  if (!sessionId) {
    return res.status(200).json({ valid: false });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    const subscription = session.subscription;

    if (subscription && (subscription.status === "active" || subscription.status === "trialing")) {
      const isReturningCustomer = subscription.metadata?.had_month_before === "true";

      return res.status(200).json({
        valid: true,
        subscriptionId: subscription.id,
        periodStart: subscription.current_period_start,
        isReturningCustomer, 
      });
    }

    return res.status(200).json({ valid: false });
  } catch (err) {
    console.error("Verify subscription error:", err);
    return res.status(200).json({ valid: false });
  }
}
