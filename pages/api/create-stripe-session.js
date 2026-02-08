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

  // ✅ PONTOS IRÁNYÍTÁS A TESZT ID-K ALAPJÁN
  if (priceId === "price_1SscYJDyLtejYlZiyDvhdaIx") {
    // 1 Day Plan
    successPath = "/day";
  } else if (priceId === "price_1SscaYDyLtejYlZiDjSeF5Wm") {
    // 1 Week Plan
    successPath = "/premium-week";
  } else if (priceId === "price_1SyaeRDyLtejYlZiWo76wuWO") {
    // 1 Month Plan (AZ ÚJ TESZT ID, AMIT KÜLDTÉL)
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
    // Visszaküldjük a hibaüzenetet a frontendnek
    return res.status(500).json({ error: err.message });
  }
}
