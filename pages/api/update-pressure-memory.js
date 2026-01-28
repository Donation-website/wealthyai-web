import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      subscriptionId,
      period,              // "2026-01"
      dominantLens,        // "rigidity" | "energy" | ...
      pressureTrend,       // "rising" | "flat" | "easing"
      ignoredArea          // "energy" | "fixed" | "none"
    } = req.body;

    if (!subscriptionId || !period || !dominantLens) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // lekérjük a meglévő subscriptiont
    const subscription = await stripe.subscriptions.retrieve(
      subscriptionId
    );

    const prevMeta = subscription.metadata || {};

    // havi history max 6 hónap (méretlimit miatt)
    let history = [];
    if (prevMeta.pressure_history) {
      try {
        history = JSON.parse(prevMeta.pressure_history);
      } catch {
        history = [];
      }
    }

    // kiszűrjük az azonos periodust
    history = history.filter(h => h.period !== period);

    history.push({
      period,
      dominantLens,
      pressureTrend,
      ignoredArea
    });

    // max 6 rekord
    history = history.slice(-6);

    await stripe.subscriptions.update(subscriptionId, {
      metadata: {
        ...prevMeta,
        last_period: period,
        last_dominant_lens: dominantLens,
        last_pressure_trend: pressureTrend || "",
        pressure_history: JSON.stringify(history)
      }
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Pressure memory error:", err);
    return res.status(500).json({ error: "Stripe update failed" });
  }
}
