import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false, // ⚠️ Stripe KÖTELEZŐ
  },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (chunk) => chunks.push(chunk));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ EZ A FONTOS ESEMÉNY
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const priceId = session.metadata?.priceId;
    const customerEmail = session.customer_details?.email;

    console.log('✅ PAYMENT CONFIRMED');
    console.log('Plan:', priceId);
    console.log('Customer:', customerEmail);

    /**
     * IDE KÉSŐBB:
     * - adatbázis
     * - user jogosultság
     * - lejárati idő
     */
  }

  res.status(200).json({ received: true });
}
