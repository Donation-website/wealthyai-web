import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ valid: false });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(200).json({ valid: false });
    }

    const priceId = session.line_items?.data?.[0]?.price?.id;

    let tier = null;
    let durationMs = 0;

    // ⬇️ EZEKET A SAJÁT TEST PRICE ID-JAIDHOZ IGAZÍTSD
    if (priceId === 'price_TEST_DAY') {
      tier = 'day';
      durationMs = 24 * 60 * 60 * 1000;
    }
    if (priceId === 'price_TEST_WEEK') {
      tier = 'week';
      durationMs = 7 * 24 * 60 * 60 * 1000;
    }
    if (priceId === 'price_TEST_MONTH') {
      tier = 'month';
      durationMs = 30 * 24 * 60 * 60 * 1000;
    }

    if (!tier) {
      return res.status(200).json({ valid: false });
    }

    return res.status(200).json({
      valid: true,
      tier,
      expiresAt: Date.now() + durationMs,
    });

  } catch (err) {
    console.error('VERIFY ERROR', err);
    return res.status(500).json({ valid: false });
  }
}
