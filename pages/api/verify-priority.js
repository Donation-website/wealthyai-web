import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ valid: false });

  try {
    const { vipCode } = req.body;
    if (!vipCode) return res.status(400).json({ valid: false });
    const trimmedCode = vipCode.trim();

    // 1. MASTER KÓD ELLENŐRZÉSE
    if (trimmedCode === "MASTER-DOMINANCE-2026") {
      return res.status(200).json({ valid: true, active: true, level: "master", redirectPath: "/premium/hub" });
    }

    // 2. STRIPE KÓD ELLENŐRZÉSE (cs_...)
    if (trimmedCode.startsWith("cs_")) {
      const session = await stripe.checkout.sessions.retrieve(trimmedCode);
      if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
        
        const priceId = session.metadata?.priceId;
        let path = "/day"; // Alapértelmezett

        if (priceId === "price_1T0LBQDyLtejYlZiXKn0PmGP") path = "/premium-week";
        else if (priceId === "price_1T0L8aDyLtejYlZik3nH3Uft") path = "/premium-month";

        return res.status(200).json({ valid: true, active: true, level: "paid", redirectPath: path });
      }
    }

    return res.status(401).json({ valid: false, message: "Érvénytelen kód" });
  } catch (err) {
    console.error("Hiba:", err);
    return res.status(500).json({ valid: false });
  }
}
