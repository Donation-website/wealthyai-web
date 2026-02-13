import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ valid: false });

  const { sessionId, vipToken } = req.body;

  // 1. VIP/MASTER AZONNALI OK
  if (vipToken === "MASTER-DOMINANCE-2026" || ["WAI-GUEST-7721", "WAI-CLIENT-8832", "WAI-PARTNER-9943"].includes(vipToken)) {
    return res.status(200).json({ valid: true });
  }

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return res.status(200).json({ valid: false });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
      return res.status(200).json({ valid: true });
    }
    
    return res.status(200).json({ valid: false });
  } catch (err) {
    console.error("Verify active error:", err);
    // Ha van sessionId, de a Stripe API épp nem válaszol, inkább engedjük be a fizetős usert
    return res.status(200).json({ valid: true });
  }
}
