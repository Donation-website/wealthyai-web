import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { priceId } = req.body;

  if (!priceId) {
    return res.status(400).json({ error: "Missing priceId" });
  }

  let successPath = "/start";

  if (priceId === "price_1SscYJDyLtejYlZiyDvhdaIx") {
    successPath = "/day";
  }

  if (priceId === "price_1SscaYDyLtejYlZiDjSeF5Wm") {
    successPath = "/premium-week";
  }

  if (priceId === "price_1SscbeDyLtejYlZixJcT3B4o") {
    successPath = "/premium-month";
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      // 🟢 EZ AZ EGYETLEN ÚJ SOR (NAGYON FONTOS)
      customer_creation: "always",

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url: `${req.headers.origin}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/start?canceled=true`,

      metadata: {
        priceId,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: "Stripe session creation failed" });
  }
}
