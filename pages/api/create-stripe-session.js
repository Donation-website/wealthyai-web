// pages/api/create-stripe-session.js
import Stripe from 'stripe';

// Az éles Stripe titkos kulcsot a Vercelből olvassa be (STRIPE_SECRET_KEY névvel kell ott lennie)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { priceId } = req.body;

    try {
      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId, // Ezt az ID-t kapjuk meg a frontendről
            quantity: 1,
          },
        ],
        mode: 'payment', // 'payment' egyszeri díjra, 'subscription' ismétlődőre
        success_url: `${req.headers.origin}/start?success=true`, // Hova menjen sikeres fizetés után
        cancel_url: `${req.headers.origin}/start?canceled=true`, // Hova menjen, ha megszakítja
      });
      res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
