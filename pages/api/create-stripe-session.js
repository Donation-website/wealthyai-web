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

  // ✅ ÉLES (LIVE) ID-K BEÁLLÍTÁSA
  if (priceId === "price_1SsRVyDyLtejYlZi3fEwvTPW") {
    // 1 Day Plan - LIVE
    successPath = "/day";
  } else if (priceId === "price_1SsRY1DyLtejYlZiglvFKufA") {
    // 1 Week Plan - LIVE
    successPath = "/premium-week";
  } else if (priceId === "price_1Sya6GDyLtejYlZiCb8oLqga") {
    // 1 Month Plan - LIVE
    successPath = "/premium-month";
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        priceId,
      },
      // A visszatérési címeknél az origin automatikusan a https://wealthyai.com (vagy aktuális domain) lesz
      success_url: `${req.headers.origin}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/start?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe Error:", err.message);
    // Ez küldi vissza a hibaüzenetet a böngészőnek, ha valami mégsem stimmel
    return res.status(500).json({ error: err.message });
  }
}
