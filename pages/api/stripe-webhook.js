import Stripe from 'stripe';
import { buffer } from 'micro';

export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  const buf = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send('Webhook Error');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const priceId = session.metadata?.priceId;
    let tier = 'day';
    let durationDays = 1;

    if (priceId === 'price_1SscYJDyLtejYlZiyDvhdaIx') {
      tier = 'day'; durationDays = 1;
    }
    if (priceId === 'price_1SscaYDyLtejYlZiDjSeF5Wm') {
      tier = 'week'; durationDays = 7;
    }
    if (priceId === 'price_1SscbeDyLtejYlZixJcT3B4o') {
      tier = 'month'; durationDays = 30;
    }

    const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;

    console.log('✅ PAYMENT CONFIRMED', {
      tier,
      expiresAt,
      email: session.customer_details?.email,
    });
  }

  res.json({ received: true });
}
