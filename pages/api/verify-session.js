import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ valid: false });
  }

  // 1. AZ EREDETI FIX KÓDOK KEZELÉSE (KIVÉTELEK)
  const masterCode = "MASTER-DOMINANCE-2026"; 
  const vipCodes = ["WAI-GUEST-7725", "WAI-CLIENT-8832", "WAI-PARTER-9943"];

  if (session_id === masterCode || vipCodes.includes(session_id)) {
    return res.status(200).json({
      valid: true,
      tier: "master",
      expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 évig érvényes
    });
  }

  // 2. STRIPE ELLENŐRZÉS
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      return res.status(200).json({ valid: false });
    }

    const priceId = session.line_items?.data?.[0]?.price?.id || null;
    let tier = null;
    let durationMs = 0;

    if (priceId === "price_1SscYJDyLtejYlZiyDvhdaIx") { tier = "day"; durationMs = 24 * 60 * 60 * 1000; }
    if (priceId === "price_1SscaYDyLtejYlZiDjSeF5Wm") { tier = "week"; durationMs = 7 * 24 * 60 * 60 * 1000; }
    if (priceId === "price_1SscbeDyLtejYlZixJcT3B4o") { tier = "month"; durationMs = 30 * 24 * 60 * 60 * 1000; }

    if (!tier) return res.status(200).json({ valid: false });

    return res.status(200).json({
      valid: true,
      tier,
      expiresAt: Date.now() + durationMs,
    });
  } catch (err) {
    console.error("VERIFY SESSION ERROR:", err);
    return res.status(500).json({ valid: false });
  }
}
