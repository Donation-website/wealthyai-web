// pages/api/create-stripe-session.js (Javított API kód)
import Stripe from 'stripe';

// Az éles Stripe titkos kulcsot a Vercelből olvassa be (STRIPE_SECRET_KEY névvel kell ott lennie)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Kivettem az apiVersiont

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { priceId } = req.body;

    // Ellenőrizd, hogy a priceId megérkezett-e a requestben
    if (!priceId) {
        return res.status(400).json({ error: "Missing priceId in request body" });
    }

    try {
      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId, // Ezt az ID-t kapjuk meg a frontendről
            quantity: 1,
          },
        ],
        // A mode-ot állítsd 'payment' (egyszeri) vagy 'subscription' (előfizetés) értékre attól függően,
        // hogyan hoztad létre a Price ID-kat a Stripe-ban.
        mode: 'payment', 
        success_url: `${req.headers.origin}/start?success=true`, // Hova menjen sikeres fizetés után
        cancel_url: `${req.headers.origin}/start?canceled=true`, // Hova menjen, ha megszakítja
      });
      res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (err) {
      console.error("Stripe API Error:", err.message); // Naplózza a pontos hibát a Vercel logokba
      res.status(500).json({ error: "Stripe session error" });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
