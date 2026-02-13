import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ active: false });

  try {
    const { vipCode } = req.body;
    if (!vipCode) return res.status(400).json({ active: false });
    const trimmedCode = vipCode.trim();

    // --- 1. MASTER & VIP KÓDOK (VISSZATÉVE ÉS JAVÍTVA) ---
    if (trimmedCode === "MASTER-DOMINANCE-2026") {
      return res.status(200).json({ active: true, level: "master", redirectPath: "/premium/hub" });
    }

    // A hiányzó havi VIP kódok (image_cc4f5f alapján)
    const monthlyVips = ["WAI-GUEST-7721", "WAI-CLIENT-8832", "WAI-PARTNER-9943"];
    if (monthlyVips.includes(trimmedCode)) {
      return res.status(200).json({ active: true, level: "guest", redirectPath: "/premium-month" });
    }

    // --- 2. STRIPE SESSION ID ELLENŐRZÉS ---
    if (trimmedCode.startsWith("cs_")) {
      const session = await stripe.checkout.sessions.retrieve(trimmedCode);
      const isValidStatus = ["paid", "no_payment_required"].includes(session.payment_status);
      
      if (isValidStatus && session.status === "complete") {
        const priceId = session.metadata?.priceId;
        let path = "/day"; // Alapértelmezett

        if (priceId === "price_1T0LBQDyLtejYlZiXKn0PmGP") path = "/premium-week";
        else if (priceId === "price_1T0L8aDyLtejYlZik3nH3Uft") path = "/premium-month";
        else if (priceId === "price_1T0LCDDyLtejYlZimOucadbT") path = "/day";

        return res.status(200).json({
          active: true,
          level: "paid",
          redirectPath: path
        });
      }
    }

    return res.status(401).json({ active: false, message: "Invalid code" });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ active: false });
  }
}
