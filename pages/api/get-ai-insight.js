export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ insight: "Method not allowed." });
  }

  try {
    const body = req.body || {};

    const {
      mode = "weekly",
      country = "US",
      weeklyIncome = 0,
      weeklySpend = 0,
      dailyTotals = [],
      breakdown = {},
    } = body;

    /* ===== SAFETY ===== */
    const safe = (v) => (typeof v === "number" && isFinite(v) ? v : 0);

    const income = safe(weeklyIncome);
    const spend = safe(weeklySpend);
    const surplus = income - spend;
    const savingsRate = income > 0 ? surplus / income : 0;

    const days = Array.isArray(dailyTotals)
      ? dailyTotals.map(safe)
      : [];

    const worstDay =
      days.length > 0 ? days.indexOf(Math.max(...days)) + 1 : null;
    const bestDay =
      days.length > 0 ? days.indexOf(Math.min(...days)) + 1 : null;

    /* ===== COUNTRY BENCHMARKS ===== */
    const COUNTRY = {
      US: { currency: "USD", avgWeekly: 900, savings: 0.2 },
      DE: { currency: "EUR", avgWeekly: 650, savings: 0.22 },
      UK: { currency: "GBP", avgWeekly: 720, savings: 0.2 },
      HU: { currency: "HUF", avgWeekly: 420, savings: 0.15 },
    };

    const ref = COUNTRY[country] || COUNTRY.US;

    /* ===== PROMPT ===== */
    const prompt = `
You are a senior financial behavior analyst.

User context:
Country: ${country}
Currency: ${ref.currency}

Weekly income: ${income}
Weekly spending: ${spend}
Weekly surplus: ${surplus}
Savings rate: ${(savingsRate * 100).toFixed(1)}%
Country average weekly spend: ${ref.avgWeekly}

Daily totals:
${days.map((v, i) => `Day ${i + 1}: ${v}`).join("\n")}

Task:
- Identify the highest spending day (Day ${worstDay}) and explain why.
- Identify the lowest spending day (Day ${bestDay}) and explain what worked.
- Compare spending to country norms.
- Evaluate savings health.
- Give 2 concrete behavior improvements.
- Give a short monthly and yearly outlook.

Rules:
- No generic advice.
- No mentioning missing data.
- Use bullet points.
- Be professional and concise.
`;

    /* ===== HUGGINGFACE ROUTER (STABLE) ===== */
    const hfResponse = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.2",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.35,
          max_tokens: 400,
        }),
      }
    );

    const hfJson = await hfResponse.json();

    const insight =
      hfJson?.choices?.[0]?.message?.content?.trim() ||
      "AI analysis temporarily unavailable.";

    return res.status(200).json({ insight });
  } catch (err) {
    console.error("HF ROUTER ERROR:", err);
    return res.status(200).json({
      insight: "AI analysis temporarily unavailable.",
    });
  }
}
