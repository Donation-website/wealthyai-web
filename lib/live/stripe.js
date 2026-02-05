import Stripe from "stripe";

// Live termékhez külön Stripe instance
export const liveStripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});
