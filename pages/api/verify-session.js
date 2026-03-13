import Stripe from "stripe";

// Ez mondja meg a Cloudflare-nek, hogy Edge módban fusson
export const runtime = 'edge';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req) {
  // Cloudflare-en a query-t így kell kinyerni
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get('session_id');

  if (!session_id) {
    return new Response(JSON.stringify({ valid: false }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  // 1. AZ EREDETI FIX KÓDOK KEZELÉSE (VÁLTOZATLAN)
  const masterCode = "MASTER-DOMINANCE-2026"; 
  const vipCodes = ["WAI-GUEST-7725", "WAI-CLIENT-8832", "WAI-PARTER-9943"];

  if (session_id === masterCode || vipCodes.includes(session_id)) {
    return new Response(JSON.stringify({
      valid: true,
      tier: "master",
      expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000),
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  // 2. STRIPE ELLENŐRZÉS
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ valid: false }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    const priceId = session.line_items?.data?.[0]?.price?.id || null;
    let tier = null;
    let durationMs = 0;

    if (priceId === "price_1SscYJDyLtejYlZiyDvhdaIx") { tier = "day"; durationMs = 24 * 60 * 60 * 1000; }
    if (priceId === "price_1SscaYDyLtejYlZiDjSeF5Wm") { tier = "week"; durationMs = 7 * 24 * 60 * 60 * 1000; }
    if (priceId === "price_1SscbeDyLtejYlZixJcT3B4o") { tier = "month"; durationMs = 30 * 24 * 60 * 60 * 1000; }

    if (!tier) {
      return new Response(JSON.stringify({ valid: false }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      valid: true,
      tier,
      expiresAt: Date.now() + durationMs,
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error("VERIFY SESSION ERROR:", err);
    return new Response(JSON.stringify({ valid: false }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
