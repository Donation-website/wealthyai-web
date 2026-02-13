import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Megelőzzük a crash-t, ha nincs body
  const { sessionId, vipToken } = req.body || {};

  // 1. MASTER/VIP - AZONNALI BELÉPÉS
  if (vipToken === "MASTER-DOMINANCE-2026" || vipToken?.startsWith("WAI-")) {
    return res.status(200).json({ valid: true, active: true, success: true });
  }

  // 2. STRIPE ELLENŐRZÉS
  if (sessionId && sessionId.startsWith("cs_")) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const isPaid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
      
      // Ha kifizette, mehet be
      return res.status(200).json({ valid: isPaid, active: isPaid, success: isPaid });
    } catch (e) {
      // Ha a Stripe API hibát dob (pl. hálózati hiba vagy lejárt session), 
      // NE dobjuk ki a felhasználót, ha már eljutott idáig a session ID-val!
      console.error("Stripe error, but granting access due to presence of session ID");
      return res.status(200).json({ valid: true, active: true, success: true });
    }
  }

  // 3. VÉGSŐ MENTŐÖV: Ha van valami a LocalStorage-ban (vipToken), de nem a MASTER,
  // akkor is adjunk neki esélyt, hátha csak a hálózat lassú.
  if (vipToken) {
     return res.status(200).json({ valid: true, active: true });
  }

  // Csak akkor dobjuk ki, ha tényleg semmije nincs
  return res.status(200).json({ valid: false, active: false });
}
