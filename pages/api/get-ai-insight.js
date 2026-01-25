export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ insight: "Method not allowed." });
  }

  try {
    const {
      country = "US",
      weeklyIncome = 0,
      weeklySpend = 0,
      dailyTotals = [],
    } = req.body;

    const safe = (v) => (typeof v === "number" && isFinite(v) ? v : 0);
    const income = safe(weeklyIncome);
    const spend = safe(weeklySpend);
    const surplus = income - spend;
    const days = Array.isArray(dailyTotals) ? dailyTotals.map(safe) : [];

    const COUNTRY = {
      US: { currency: "USD", avgWeekly: 900 },
      DE: { currency: "EUR", avgWeekly: 650 },
      UK: { currency: "GBP", avgWeekly: 720 },
      HU: { currency: "HUF", avgWeekly: 420 },
    };
    const ref = COUNTRY[country] || COUNTRY.US;

    const prompt = `[INST] You are a financial analyst. Analyze this:
    - Country: ${country} (${ref.currency})
    - Weekly income: ${income}
    - Weekly spending: ${spend}
    - Daily data: ${days.join(", ")}
    Give 2 tips and a short outlook. [/INST]`;

    const response = await fetch(
      "https://router.huggingface.co",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 500, temperature: 0.7 }
        }),
      }
    );

    const result = await response.json();
    console.log("HF API RAW RESULT:", JSON.stringify(result)); // Ezt nézd a terminálban!

    // 1. HIBAKEZELÉS: Ha az API hibaüzenetet küld
    if (result.error) {
      return res.status(200).json({ insight: `HF API Error: ${result.error}` });
    }

    // 2. ADATKINYERÉS: A Router API gyakran listát ad vissza: [{ generated_text: "..." }]
    let aiText = "";
    if (Array.isArray(result) && result[0]?.generated_text) {
      aiText = result[0].generated_text;
    } else if (result.generated_text) {
      aiText = result.generated_text;
    } else {
      aiText = "Could not parse AI response. Check server logs.";
    }

    // Tisztítás: néha az AI megismétli a promptot, ezt vágjuk le
    const cleanText = aiText.replace(prompt, "").trim();

    return res.status(200).json({ insight: cleanText });

  } catch (err) {
    console.error("CRITICAL SERVER ERROR:", err);
    return res.status(200).json({
      insight: `System Error: ${err.message}. Please check your environment variables.`
    });
  }
}
