import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ valid: false });

  try {
    const { vipCode } = req.body;
    if (!vipCode) return res.status(400).json({ valid: false });
    const trimmedCode = vipCode.trim();

    // 1. MASTER KÓD (Örök hozzáférés neked)
    if (trimmedCode === "MASTER-DOMINANCE-2026") {
      return res.status(200).json({ valid: true, active: true, level: "master", redirectPath: "/premium/hub" });
    }

    // 2. REKLÁM CÉLÚ VIP KÓDOK (Manuális kezelés: ha lejárt, töröld innen)
    const activePromoCodes = ["VIP-PROMO-01", "VIP-PROMO-02"]; 
    if (activePromoCodes.includes(trimmedCode)) {
      return res.status(200).json({ valid: true, active: true, level: "paid", redirectPath: "/premium-month" });
    }

    // 3. STRIPE KÓD ELLENŐRZÉSE (Fizetős és 100% Free kuponos is ide fut be)
    if (trimmedCode.startsWith("cs_")) {
      const session = await stripe.checkout.sessions.retrieve(trimmedCode);
      
      if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
        
        const createdTimestamp = session.created; // A vásárlás/generálás pillanata (Unix timestamp)
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const priceId = session.metadata?.priceId;
        
        let durationInSeconds = 24 * 60 * 60; // Alapértelmezett: 1 nap
        let path = "/day";

        // Csomag azonosítás és időtartam hozzárendelés
        if (priceId === "price_1T0LBQDyLtejYlZiXKn0PmGP") {
          path = "/premium-week";
          durationInSeconds = 7 * 24 * 60 * 60; 
        } else if (priceId === "price_1T0L8aDyLtejYlZik3nH3Uft") {
          path = "/premium-month";
          durationInSeconds = 30 * 24 * 60 * 60; 
        }

        // LEJÁRAT ELLENŐRZÉSE: most > (vásárlás + tartam)
        if (nowInSeconds > (createdTimestamp + durationInSeconds)) {
          return res.status(401).json({ 
            valid: false, 
            message: "This access code has expired." 
          });
        }

        return res.status(200).json({ 
          valid: true, 
          active: true, 
          level: "paid", 
          redirectPath: path 
        });
      }
    }

    return res.status(401).json({ valid: false, message: "Invalid or expired code." });
  } catch (err) {
    console.error("Stripe verification error:", err);
    return res.status(500).json({ valid: false });
  }
}
