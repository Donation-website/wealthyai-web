import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ active: false });

  try {
    const { vipCode } = req.body;
    if (!vipCode) return res.status(400).json({ active: false });
    const trimmedCode = vipCode.trim();

    // 1. MASTER & VIP KÓDOK
    if (trimmedCode === "MASTER-DOMINANCE-2026") {
      return res.status(200).json({ active: true, level: "master", redirectPath: "/premium/hub" });
    }

    // 2. STRIPE SESSION ID ELLENŐRZÉS
    if (trimmedCode.startsWith("cs_")) {
      console.log("🔍 Ellenőrzés indítása a kóddal:", trimmedCode);
      const session = await stripe.checkout.sessions.retrieve(trimmedCode);
      
      // Elfogadjuk a kifizetett és a kuponos (no_payment_required) státuszt is
      const isValidStatus = ["paid", "no_payment_required"].includes(session.payment_status);
      const isComplete = session.status === "complete";

      if (isValidStatus && isComplete) {
        const createdTimestamp = session.created * 1000;
        const now = Date.now();
        
        // Alapértelmezett értékek, ha a metadata hiányozna
        let daysAllowed = 1;
        let path = "/day";

        const priceId = session.metadata?.priceId;
        console.log("📋 Talált PriceID:", priceId);

        if (priceId === "price_1T0LBQDyLtejYlZiXKn0PmGP") { 
          daysAllowed = 7; path = "/premium-week";
        } else if (priceId === "price_1T0L8aDyLtejYlZik3nH3Uft") { 
          daysAllowed = 30; path = "/premium-month";
        } else if (priceId === "price_1T0LCDDyLtejYlZimOucadbT") { 
          daysAllowed = 1; path = "/day";
        }

        const expiryDate = createdTimestamp + (daysAllowed * 24 * 60 * 60 * 1000);

        if (now < expiryDate) {
          console.log("✅ Hozzáférés megadva ide:", path);
          return res.status(200).json({
            active: true,
            level: "paid",
            redirectPath: path
          });
        }
      }
    }
    
    console.log("❌ Érvénytelen vagy lejárt kód");
    return res.status(401).json({ active: false, message: "Invalid or expired code." });

  } catch (err) {
    console.error("❌ Szerver hiba:", err.message);
    return res.status(500).json({ active: false });
  }
}
