import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
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

    if (
      subscription &&
      subscription.status === "active"
    ) {
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
