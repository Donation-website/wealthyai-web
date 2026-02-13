import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ active: false });

  try {
    const { vipCode } = req.body;
    if (!vipCode) return res.status(400).json({ active: false, error: "No code provided" });
    const trimmedCode = vipCode.trim();

    console.log("🚀 Verifying code:", trimmedCode);

    // 1. MASTER & VIP KÓDOK
    if (trimmedCode === "MASTER-DOMINANCE-2026") {
      return res.status(200).json({ active: true, level: "master", redirectPath: "/premium/hub" });
    }

    // 2. STRIPE SESSION ID ELLENŐRZÉS
    if (trimmedCode.startsWith("cs_")) {
      try {
        const session = await stripe.checkout.sessions.retrieve(trimmedCode);
        
        // Elfogadjuk: paid VAGY no_payment_required (kupon)
        const isValidStatus = ["paid", "no_payment_required"].includes(session.payment_status);
        const isComplete = session.status === "complete";

        if (isValidStatus && isComplete) {
          const createdTimestamp = session.created * 1000;
          const now = Date.now();
          
          let daysAllowed = 1;
          let path = "/day";

          // Metadata ellenőrzés
          const priceId = session.metadata?.priceId;
          console.log("📦 Found PriceID:", priceId);

          if (priceId === "price_1T0LBQDyLtejYlZiXKn0PmGP") { 
            daysAllowed = 7; path = "/premium-week";
          } else if (priceId === "price_1T0L8aDyLtejYlZik3nH3Uft") { 
            daysAllowed = 30; path = "/premium-month";
          } else if (priceId === "price_1T0LCDDyLtejYlZimOucadbT") { 
            daysAllowed = 1; path = "/day";
          }

          const expiryDate = createdTimestamp + (daysAllowed * 24 * 60 * 60 * 1000);

          if (now < expiryDate) {
            return res.status(200).json({
              active: true,
              level: "paid",
              redirectPath: path
            });
          }
          return res.status(401).json({ active: false, message: "Expired session" });
        }
      } catch (stripeErr) {
        console.error("❌ Stripe API error:", stripeErr.message);
        return res.status(401).json({ active: false, error: "Stripe error: " + stripeErr.message });
      }
    }
    
    return res.status(401).json({ active: false, message: "Invalid code format" });

  } catch (err) {
    console.error("❌ Critical Server Error:", err.message);
    return res.status(500).json({ active: false, error: err.message });
  }
}
