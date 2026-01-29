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

  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(200).json({ valid: false });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    const subscription = session.subscription;

    if (subscription && subscription.status === "active") {
      return res.status(200).json({
        valid: true,
        subscriptionId: subscription.id,
        periodStart: subscription.current_period_start,
      });
    }

    return res.status(200).json({ valid: false });
  } catch (err) {
    console.error("Verify subscription error:", err);
    return res.status(200).json({ valid: false });
  }
}
