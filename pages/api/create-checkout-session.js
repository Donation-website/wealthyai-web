// pages/api/create-checkout-session.js
import Stripe from 'stripe';

// A titkos kulcsot a Vercel Environment Variables-ből húzza be
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { priceId } = req.body;
    try {
      // Itt add meg a majdani sikeres és sikertelen visszatérési URL-eket
      const successUrl = `${req.headers.origin}/success`; // Egyelőre csak a főoldalra visz vissza
      const cancelUrl = `${req.headers.origin}/`; 

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

      // Visszaküldi a kliensnek a Stripe session ID-t
      res.status(200).json({ sessionId: session.id });
    } catch (err) {
      res.status(500).json({ error: 'Error creating checkout session' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
