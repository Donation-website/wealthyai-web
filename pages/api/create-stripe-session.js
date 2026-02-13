import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { priceId } = req.body;
    if (!priceId) {
      return res.status(400).json({ error: "Missing priceId" });
    }

    let successPath = "/start";
    if (priceId === "price_1SsRVyDyLtejYlZi3fEwvTPW") successPath = "/day";
    else if (priceId === "price_1SsRY1DyLtejYlZiglvFKufA") successPath = "/premium-week";
    else if (priceId === "price_1Sya6GDyLtejYlZiCb8oLqga") successPath = "/premium-month";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      // ✅ ITT A KUPONKÓD MEZŐ, VISSZATETTEM!
      allow_promotion_codes: true, 
      // ✅ ÉS ITT A LEÁLLÍTÁS, HOGY NE VONJA LE TÖBBSZÖR
      subscription_data: {
        cancel_at_period_end: true,
      },
      success_url: `${req.headers.origin}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/start?canceled=true`,
      metadata: {
        priceId: priceId
      }
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("STRIPE HIBA:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
