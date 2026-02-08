import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const { priceId } = req.body;
  if (!priceId) {
    return res.status(400).json({ error: "Missing priceId" });
  }

  let successPath = "/start";

  // ✅ IRÁNYÍTÁS MINDHÁROM TÍPUSHOZ
  if (priceId === "price_1SscYJDyLtejYlZiyDvhdaIx") {
    successPath = "/day";
  } else if (priceId === "price_1SscaYDyLtejYlZiDjSeF5Wm") {
    successPath = "/premium-week";
  } else if (priceId === "price_1Sya6GDyLtejYlZiCb8oLqga") {
    // EZ AZ ÚJ 49.99-ES ID
    successPath = "/premium-month";
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        priceId,
      },
      success_url: `${req.headers.origin}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/start?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
