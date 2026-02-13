import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ active: false });
  }

  try {
    const { vipCode } = req.body;
    if (!vipCode) return res.status(400).json({ active: false });

    const trimmedCode = vipCode.trim();

    // --- 1. MASTER & VIP KÓDOK ---
    if (trimmedCode === "MASTER-DOMINANCE-2026") {
      return res.status(200).json({ active: true, level: "master", redirectPath: "/premium/hub" });
    }

    const guestCodes = ["WAI-GUEST-7721", "WAI-CLIENT-8832", "WAI-PARTNER-9943"];
    if (guestCodes.includes(trimmedCode)) {
      return res.status(200).json({ active: true, level: "guest", redirectPath: "/premium-month" });
    }

    // --- 2. STRIPE SESSION ID ELLENŐRZÉS ---
    if (trimmedCode.startsWith("cs_")) {
      const session = await stripe.checkout.sessions.retrieve(trimmedCode);
      
      // JAVÍTÁS: Elfogadjuk a 'paid' ÉS a 'no_payment_required' (kupon) státuszt is
      const isPaid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
      const isComplete = session.status === "complete";

      if (isPaid && isComplete) {
        const createdTimestamp = session.created * 1000; 
        const now = Date.now();
        const priceId = session.metadata?.priceId;

        let daysAllowed = 1;
        let path = "/day";

        // ID-K ELLENŐRZÉSE
        if (priceId === "price_1T0LBQDyLtejYlZiXKn0PmGP") { // 1 Week
          daysAllowed = 7; 
          path = "/premium-week";
        }
        else if (priceId === "price_1T0L8aDyLtejYlZik3nH3Uft") { // 1 Month
          daysAllowed = 30; 
          path = "/premium-month";
        }
        else if (priceId === "price_1T0LCDDyLtejYlZimOucadbT") { // 1 Day
          daysAllowed = 1;
          path = "/day";
        }

        const expiryDate = createdTimestamp + (daysAllowed * 24 * 60 * 60 * 1000);

        if (now < expiryDate) {
          return res.status(200).json({
            active: true,
            level: "paid",
            redirectPath: path
          });
        } else {
          return res.status(401).json({ active: false, message: "This session has expired." });
        }
      }
    }

    return res.status(401).json({ active: false, message: "Invalid code." });

  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ active: false });
  }
}
