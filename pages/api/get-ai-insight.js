export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      mode,
      country = "US",
      weeklyIncome = 0,
      weeklySpend = 0,
      dailyTotals = [],
      breakdown = {},
    } = req.body;

    // ===== SAFETY =====
    const safe = (v) => (typeof v === "number" && !isNaN(v) ? v : 0);

    const income = safe(weeklyIncome);
    const spend = safe(weeklySpend);
    const days = dailyTotals.map(safe);

    // ===== COUNTRY BENCHMARKS =====
    const BENCH = {
      US: { avg: 900, entertainment: 0.12 },
      DE: { avg: 650, entertainment: 0.10 },
      UK: { avg: 720, entertainment: 0.11 },
      HU: { avg: 420, entertainment: 0.08 },
    };

    const ref = BENCH[country] || BENCH.US;

    // ===== ANALYTICS =====
    const worstDayIndex = days.indexOf(Math.max(...days));
    const bestDayIndex = days.indexOf(Math.min(...days));

    // ===== AI PROMPT =====
    const prompt = `
You are a senior financial behavior analyst.

Context:
Country: ${country}
Weekly net income: ${income} USD
Total weekly spending: ${spend} USD
Country average weekly spending: ${ref.avg} USD

Daily spending:
${days.map((v, i) => `Day ${i + 1}: ${v} USD`).join("\n")}

Spending breakdown:
${JSON.stringify(breakdown, null, 2)}

Your task:
1. Identify the WORST spending day and explain why.
2. Identify the BEST spending day and explain what went well.
3. Compare the user's spending to the country average.
4. Give 2 concrete, realistic improvements.
5. End with one actionable focus point for next week.

Rules:
- Do NOT say data is missing.
- Do NOT give generic advice.
- Be precise and professional.
- Use bullet points.
`;

    // ===== CALL AI (HF / OpenAI / Router) =====
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      }),
    });

    const json = await response.json();
    const text =
      json?.choices?.[0]?.message?.content ||
      "AI analysis unavailable.";

    return res.status(200).json({ insight: text });
  } catch (err) {
    console.error("AI ERROR:", err);
    return res.status(200).json({
      insight:
        "AI analysis temporarily unavailable. Please try again shortly.",
    });
  }
}
