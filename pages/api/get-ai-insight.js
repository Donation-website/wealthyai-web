export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ insight: "Method not allowed." });
  }

  try {
    const {
      country,
      weeklyIncome,
      weeklySpend,
      dailyTotals,
      breakdown,
    } = req.body;

    const prompt = `
You are a financial behavior analysis AI.

INPUT DATA:
Country: ${country}
Weekly income: ${weeklyIncome}
Weekly spending: ${weeklySpend}
Daily totals: ${JSON.stringify(dailyTotals)}
Category breakdown: ${JSON.stringify(breakdown)}

TASK:
- Analyze spending behavior
- Detect inefficiencies or risk
- Evaluate sustainability
- Give 3 actionable recommendations

RULES:
- Analytical tone
- No greetings
- No emojis
- Structured output
`;

    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.2,
            top_p: 0.9,
            return_full_text: false,
          },
          options: {
            wait_for_model: true, // 🔥 EZ A KULCS
          },
        }),
      }
    );

    const raw = await hfRes.text();

    if (!hfRes.ok) {
      console.error("HF RAW ERROR:", raw);
      return res.status(500).json({
        insight: "AI engine unavailable (HF backend). Try again.",
      });
    }

    const json = JSON.parse(raw);

    const text =
      json?.[0]?.generated_text ||
      "AI produced no usable output.";

    return res.status(200).json({ insight: text.trim() });

  } catch (err) {
    console.error("AI crash:", err);
    return res.status(500).json({
      insight: "AI system error.",
    });
  }
}
