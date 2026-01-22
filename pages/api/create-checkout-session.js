// pages/api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { priceId } = req.body;
    try {
      // Helyettesítsd be a majdani éles domain neveddel:
      const successUrl = `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${req.headers.origin}/?cancelled=true`;

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription', // Mivel előfizetést adunk el
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      res.status(200).json({ sessionId: session.id });
    } catch (err) {
      res.status(500).json({ error: 'Error creating checkout session' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
