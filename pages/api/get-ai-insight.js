export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    /* =========================
       PAYLOAD (NEW STRUCTURE)
    ========================== */
    const {
      mode = "weekly",
      context = {},
    } = req.body;

    const {
      country = "US",
      income = 0,
      totalSpend = 0,
      daily = [],
    } = context;

    const safe = (v) => (typeof v === "number" && !isNaN(v) ? v : 0);

    const weeklyIncome = safe(income);
    const weeklySpend = safe(totalSpend);
    const dailyTotals = daily.map(d => safe(d.total));

    /* =========================
       COUNTRY BENCHMARKS
    ========================== */
    const COUNTRY = {
      US: { currency: "USD", avgWeeklySpend: 900, savingsTarget: 0.20 },
      DE: { currency: "EUR", avgWeeklySpend: 650, savingsTarget: 0.22 },
      UK: { currency: "GBP", avgWeeklySpend: 720, savingsTarget: 0.20 },
      HU: { currency: "HUF", avgWeeklySpend: 420, savingsTarget: 0.15 },
      GLOBAL: { currency: "USD", avgWeeklySpend: 700, savingsTarget: 0.20 },
    };

    const ref = COUNTRY[country] || COUNTRY.GLOBAL;

    /* =========================
       DERIVED METRICS
    ========================== */
    const surplus = weeklyIncome - weeklySpend;
    const savingsRate =
      weeklyIncome > 0 ? surplus / weeklyIncome : 0;

    const maxDay = Math.max(...dailyTotals);
    const minDay = Math.min(...dailyTotals);

    const worstDay = daily.find(d => d.total === maxDay)?.day || "N/A";
    const bestDay = daily.find(d => d.total === minDay)?.day || "N/A";

    /* =========================
       AI PROMPT (FIXED & CLEAN)
    ========================== */
    const prompt = `
You are a senior financial behavior analyst.

User profile:
- Country: ${country}
- Currency: ${ref.currency}

Weekly numbers:
- Income: ${weeklyIncome}
- Spending: ${weeklySpend}
- Surplus: ${surplus}
- Savings rate: ${(savingsRate * 100).toFixed(1)}%
- Country average weekly spend: ${ref.avgWeeklySpend}

Daily spending totals:
${daily.map(d => `${d.day}: ${d.total}`).join("\n")}

Key observations:
- Highest spending day: ${worstDay}
- Lowest spending day: ${bestDay}

Your task:
1. Explain why the worst day is risky.
2. Explain what worked on the best day.
3. Compare spending to country norms.
4. Identify ONE behavioral risk.
5. Give TWO specific, actionable improvements.
6. End with ONE clear focus for next week.

Rules:
- No generic advice.
- No mentioning missing data.
- Be concise, professional, and specific.
- Bullet points only.
`;

    /* =========================
       AI CALL
    ========================== */
    const response = await fetch(
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
          temperature: 0.3,
        }),
      }
    );

    const json = await response.json();
    const text =
      json?.choices?.[0]?.message?.content ||
      "AI analysis temporarily unavailable.";

    return res.status(200).json({ insight: text });

  } catch (err) {
    console.error("AI ERROR:", err);
    return res.status(200).json({
      insight: "AI analysis temporarily unavailable. Please try again later.",
    });
  }
}
