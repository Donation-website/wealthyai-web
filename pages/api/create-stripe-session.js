// pages/api/create-stripe-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: "Missing priceId" });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        // Átváltva 'subscription' módra, mert az áraid ismétlődőek (recurring)
        mode: 'subscription', 
        success_url: `${req.headers.origin}/start?success=true`,
        cancel_url: `${req.headers.origin}/start?canceled=true`,
      });
      
      res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (err) {
      console.error("Stripe API Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
