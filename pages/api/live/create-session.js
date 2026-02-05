import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 🔒 HARD-CODED LIVE PRICE (€29.99)
const LIVE_PRICE_ID = "price_1SxRUGDyLtejYlZiBIbwZXlx";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription", // Live csomag: always-on access

      line_items: [
        {
          price: LIVE_PRICE_ID,
          quantity: 1,
        },
      ],

      // 🔐 Explicit metadata – csak live
      metadata: {
        product: "live-financial-environment",
        priceId: LIVE_PRICE_ID,
      },

      success_url: `${req.headers.origin}/live/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/live?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("LIVE STRIPE ERROR:", err);
    return res.status(500).json({ error: "Stripe error" });
  }
}
