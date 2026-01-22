// pages/api/create-stripe-session.js

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { priceId } = req.body;

  if (!priceId) {
    return res.status(400).json({ error: 'Missing priceId' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      // 👉 SIKERES FIZETÉS UTÁN IDE MEGY
      success_url: `${req.headers.origin}/premium?session_id={CHECKOUT_SESSION_ID}`,

      // 👉 MEGSZAKÍTOTT FIZETÉS
      cancel_url: `${req.headers.origin}/start?canceled=true`,
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);

    return res.status(500).json({
      error: 'Stripe session creation failed',
      details: error.message,
    });
  }
}
