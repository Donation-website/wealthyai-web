export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ insight: "Method not allowed." });
  }

  try {
    const {
      mode = "weekly",
      country = "US",
      weeklyIncome = 0,
      weeklySpend = 0,
      dailyTotals = [],
      breakdown = {},
    } = req.body;

    /* ===== SAFETY ===== */
    const safe = (v) => (typeof v === "number" && isFinite(v) ? v : 0);

    const income = safe(weeklyIncome);
    const spend = safe(weeklySpend);
    const surplus = income - spend;
    const savingsRate = income > 0 ? surplus / income : 0;

    const days = Array.isArray(dailyTotals)
      ? dailyTotals.map(safe)
      : [];

    const worstDayIndex =
      days.length > 0 ? days.indexOf(Math.max(...days)) : null;
    const bestDayIndex =
      days.length > 0 ? days.indexOf(Math.min(...days)) : null;

    /* ===== COUNTRY BENCHMARKS ===== */
    const COUNTRY = {
      US: { currency: "USD", avgWeekly: 900, savings: 0.2 },
      DE: { currency: "EUR", avgWeekly: 650, savings: 0.22 },
      UK: { currency: "GBP", avgWeekly: 720, savings: 0.2 },
      HU: { currency: "HUF", avgWeekly: 420, savings: 0.15 },
    };

    const ref = COUNTRY[country] || COUNTRY.US;

    /* ===== PROMPT (STABLE, NOT OVERCOMPLEX) ===== */
    const prompt = `
You are a professional financial analyst.

Context:
- Country: ${country}
- Currency: ${ref.currency}
- Weekly income: ${income}
- Weekly spending: ${spend}
- Weekly surplus: ${surplus}
- Savings rate: ${(savingsRate * 100).toFixed(1)}%
- Country average weekly spending: ${ref.avgWeekly}

Daily spending totals:
${days.map((v, i) => `Day ${i + 1}: ${v}`).join("\n")}

Task:
- Identify the highest spending day and explain why.
- Identify the lowest spending day and explain what worked.
- Compare spending to country average.
- Comment on savings health.
- Give 2 concrete, realistic improvements.
- Give a short outlook for monthly and yearly impact.

Rules:
- Be specific.
- No generic advice.
- No mentioning missing data.
- Use bullet points.
`;

    /* ===== HF API CALL ===== */
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 350,
            temperature: 0.3,
            return_full_text: false,
          },
        }),
      }
    );

    const result = await response.json();

    const text =
      Array.isArray(result) && result[0]?.generated_text
        ? result[0].generated_text.trim()
        : "AI analysis temporarily unavailable.";

    return res.status(200).json({ insight: text });
  } catch (err) {
    console.error("HF AI ERROR:", err);
    return res.status(200).json({
      insight:
        "AI analysis temporarily unavailable. Please try again in a moment.",
    });
  }
}
