import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false });

  try {
    const { vipCode } = req.body;
    if (!vipCode) return res.status(400).json({ success: false });
    const trimmedCode = vipCode.trim();

    // 1. MASTER KÓD (Mindig első)
    if (trimmedCode === "MASTER-DOMINANCE-2026") {
      return res.status(200).json({ 
        valid: true, active: true, success: true, 
        level: "master", redirectPath: "/premium/hub" 
      });
    }

    // 2. FIZETŐS USER (cs_ kód)
    if (trimmedCode.startsWith("cs_")) {
      const session = await stripe.checkout.sessions.retrieve(trimmedCode);
      const isPaid = ["paid", "no_payment_required"].includes(session.payment_status);
      
      if (isPaid) {
        const priceId = session.metadata?.priceId;
        let path = "/day";
        if (priceId === "price_1T0LBQDyLtejYlZiXKn0PmGP") path = "/premium-week";
        else if (priceId === "price_1T0L8aDyLtejYlZik3nH3Uft") path = "/premium-month";

        return res.status(200).json({
          valid: true, active: true, success: true,
          level: "paid", redirectPath: path
        });
      }
    }

    return res.status(401).json({ valid: false, active: false, success: false });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ valid: false, active: false, success: false });
  }
}
