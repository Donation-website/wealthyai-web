export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      country = "US",
      weeklyIncome = 0,
      weeklySpend = 0,
      dailyTotals = [],
      breakdown = {},
    } = req.body;

    /* =========================
       SAFETY / NORMALIZATION
    ========================== */
    const safe = (v) => (typeof v === "number" && !isNaN(v) ? v : 0);

    const income = safe(weeklyIncome);
    const spend = safe(weeklySpend);
    const days = dailyTotals.map(safe);

    /* =========================
       EXTENDED COUNTRY DATA
    ========================== */
    const COUNTRY = {
      US: {
        currency: "USD",
        avgWeeklySpend: 900,
        rentPct: 0.32,
        foodPct: 0.17,
        transportPct: 0.12,
        entertainmentPct: 0.11,
        savingsTarget: 0.20,
      },
      DE: {
        currency: "EUR",
        avgWeeklySpend: 650,
        rentPct: 0.29,
        foodPct: 0.16,
        transportPct: 0.14,
        entertainmentPct: 0.10,
        savingsTarget: 0.22,
      },
      UK: {
        currency: "GBP",
        avgWeeklySpend: 720,
        rentPct: 0.34,
        foodPct: 0.18,
        transportPct: 0.13,
        entertainmentPct: 0.11,
        savingsTarget: 0.20,
      },
      HU: {
        currency: "HUF",
        avgWeeklySpend: 420,
        rentPct: 0.35,
        foodPct: 0.22,
        transportPct: 0.15,
        entertainmentPct: 0.08,
        savingsTarget: 0.15,
      },
      GLOBAL: {
        currency: "USD",
        avgWeeklySpend: 700,
        rentPct: 0.30,
        foodPct: 0.18,
        transportPct: 0.13,
        entertainmentPct: 0.10,
        savingsTarget: 0.20,
      },
    };

    const ref = COUNTRY[country] || COUNTRY.GLOBAL;

    /* =========================
       DERIVED ANALYTICS
    ========================== */
    const surplus = income - spend;
    const savingsRate = income > 0 ? surplus / income : 0;

    const worstDayIndex = days.length
      ? days.indexOf(Math.max(...days))
      : null;

    const bestDayIndex = days.length
      ? days.indexOf(Math.min(...days))
      : null;

    /* =========================
       AI PROMPT (PRO LEVEL)
    ========================== */
    const prompt = `
You are a senior financial behavior analyst.

User context:
Country: ${country}
Currency: ${ref.currency}

Weekly income: ${income}
Weekly spending: ${spend}
Weekly surplus: ${surplus}
Savings rate: ${(savingsRate * 100).toFixed(1)}%
Country average weekly spend: ${ref.avgWeeklySpend}

Daily spending:
${days.map((v, i) => `Day ${i + 1}: ${v}`).join("\n")}

Spending breakdown:
${JSON.stringify(breakdown, null, 2)}

Country norms:
- Rent target: ${(ref.rentPct * 100).toFixed(0)}%
- Food target: ${(ref.foodPct * 100).toFixed(0)}%
- Transport target: ${(ref.transportPct * 100).toFixed(0)}%
- Entertainment target: ${(ref.entertainmentPct * 100).toFixed(0)}%
- Savings target: ${(ref.savingsTarget * 100).toFixed(0)}%

Your task:
1. Identify the worst spending day and explain WHY.
2. Identify the best spending day and explain WHAT worked.
3. Compare the user's spending to country averages.
4. Highlight one structural risk.
5. Give 2 concrete behavioral improvements.
6. End with ONE focus action for next week.

Rules:
- No generic advice.
- No mentioning missing data.
- Be precise, professional, calm.
- Use bullet points.
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
          temperature: 0.35,
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
      insight:
        "AI analysis temporarily unavailable. Please try again later.",
    });
  }
}
