import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { priceId, tier } = req.body;

  if (!priceId || !tier) {
    return res.status(400).json({ error: "Missing priceId or tier" });
  }

  let successPath = "/";

  if (tier === "day") successPath = "/day";
  if (tier === "premium-week") successPath = "/premium-week";
  if (tier === "premium-month") successPath = "/premium-month";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment", // ❗ FONTOS: nem subscription most
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}${successPath}`,
      cancel_url: `${req.headers.origin}/start`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: "Stripe session creation failed" });
  }
}
