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
Analyze the following financial data and produce an analytical report.

Country: ${country}
Weekly income: ${weeklyIncome}
Weekly spending: ${weeklySpend}
Daily totals: ${JSON.stringify(dailyTotals)}
Category breakdown: ${JSON.stringify(breakdown)}

Return:
- Spending pattern analysis
- Financial risk assessment
- 3 improvement recommendations
`;

    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-large",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 250,
          },
        }),
      }
    );

    const raw = await hfRes.text();

    if (!hfRes.ok) {
      console.error("HF ERROR:", raw);
      return res.status(500).json({
        insight: "AI backend unavailable.",
      });
    }

    const json = JSON.parse(raw);

    const text =
      json?.[0]?.generated_text ||
      "AI returned no analysis.";

    return res.status(200).json({ insight: text.trim() });

  } catch (err) {
    console.error("AI crash:", err);
    return res.status(500).json({
      insight: "AI system error.",
    });
  }
}
