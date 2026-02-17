import Stripe from "stripe";
import { enterpriseShield } from "../../lib/securityShield";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {

  try {

    // 🔒 ENTERPRISE SHIELD (5 kérés / óra / IP)
    await enterpriseShield(req, "stripe", 5);

    if (req.method !== "POST") {
      return res.status(405).end("Method Not Allowed");
    }

    const { priceId } = req.body;
    if (!priceId) {
      return res.status(400).json({ error: "Missing priceId" });
    }

    let successPath = "/start";

    // ✅ ONE-OFF ID-K ÉS ÚTVONALAK
    if (priceId === "price_1T0LCDDyLtejYlZimOucadbT") {
      successPath = "/day";
    } else if (priceId === "price_1T0LBQDyLtejYlZiXKn0PmGP") {
      successPath = "/premium-week";
    } else if (priceId === "price_1T0L8aDyLtejYlZik3nH3Uft") {
      successPath = "/premium-month";
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      metadata: {
        priceId,
      },
      success_url: `${req.headers.origin}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/start?canceled=true`,
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {

    if (err.message === "IP_BLOCKED") {
      return res.status(403).json({ error: "Access temporarily blocked." });
    }

    if (err.message === "RATE_LIMIT_EXCEEDED") {
      return res.status(429).json({
        error: "Too many requests. Please try again later."
      });
    }

    console.error("Stripe Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
