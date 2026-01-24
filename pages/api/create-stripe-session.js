import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const { priceId, tier } = req.body;

  if (!priceId || !tier) {
    return res.status(400).json({ error: "Missing priceId or tier" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment", // NEM subscription – ez fontos
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        tier, // 🔑 EZ DÖNTI EL A PREMIUM OLDALT
      },
      success_url: `${req.headers.origin}/premium?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/start`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: "Stripe session creation failed" });
  }
}
