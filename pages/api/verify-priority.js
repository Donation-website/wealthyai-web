import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ valid: false, active: false });

  try {
    const { vipCode } = req.body;
    if (!vipCode) return res.status(400).json({ valid: false, active: false });
    const trimmedCode = vipCode.trim();

    // 1. MASTER KÓD
    if (trimmedCode === "MASTER-DOMINANCE-2026") {
      return res.status(200).json({ valid: true, active: true, level: "master", redirectPath: "/premium/hub" });
    }

    // 2. HAVI VIP KÓDOK (Csak a megadott oldalakhoz)
    const monthlyVips = ["WAI-GUEST-7721", "WAI-CLIENT-8832", "WAI-PARTNER-9943"];
    if (monthlyVips.includes(trimmedCode)) {
      return res.status(200).json({ valid: true, active: true, level: "guest", redirectPath: "/premium-month" });
    }

    // 3. STRIPE SESSION (Fizetős userek)
    if (trimmedCode.startsWith("cs_")) {
      const session = await stripe.checkout.sessions.retrieve(trimmedCode);
      const isPaid = ["paid", "no_payment_required"].includes(session.payment_status);
      
      if (isPaid) {
        const priceId = session.metadata?.priceId;
        let path = "/day"; // Alapértelmezett

        if (priceId === "price_1T0LBQDyLtejYlZiXKn0PmGP") path = "/premium-week";
        else if (priceId === "price_1T0L8aDyLtejYlZik3nH3Uft") path = "/premium-month";
        else if (priceId === "price_1T0LCDDyLtejYlZimOucadbT") path = "/day";

        return res.status(200).json({
          valid: true,   // A frontend ezt keresi
          active: true,  // Meg ez is itt van a biztonság kedvéért
          level: "paid",
          redirectPath: path
        });
      }
    }

    return res.status(401).json({ valid: false, active: false });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ valid: false, active: false });
  }
}
