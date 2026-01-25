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
This is NOT a chat. Produce a structured analytical report.

Country: ${country}
Weekly income: ${weeklyIncome}
Weekly spending: ${weeklySpend}
Daily totals: ${JSON.stringify(dailyTotals)}
Category breakdown: ${JSON.stringify(breakdown)}

TASK:
1. Analyze spending behavior patterns
2. Identify financial risks or inefficiencies
3. Compare spending intensity to income
4. Give 3 concrete improvement recommendations

Style:
- Analytical
- Concise
- Professional
- No emojis
- No greetings
`;

    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
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

    if (!hfRes.ok) {
      const err = await hfRes.text();
      console.error("HF error:", err);
      return res.status(500).json({
        insight: "AI engine unavailable (HF error).",
      });
    }

    const result = await hfRes.json();

    const text =
      result?.[0]?.generated_text ||
      "AI returned no usable output.";

    return res.status(200).json({ insight: text.trim() });

  } catch (err) {
    console.error("AI Insight crash:", err);
    return res.status(500).json({
      insight: "AI system error.",
    });
  }
}
