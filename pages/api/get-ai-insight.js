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

    const systemPrompt = `
You are a professional financial behavior analysis AI.
This is NOT a chat assistant.

Your task:
- Analyze financial behavior
- Identify inefficiencies and risks
- Evaluate sustainability
- Provide clear, actionable insights

Tone:
- Analytical
- Professional
- Concise
- No greetings
- No emojis
`;

    const userPrompt = `
DATASET

Country: ${country}
Weekly income: ${weeklyIncome}
Weekly spending: ${weeklySpend}
Daily totals: ${JSON.stringify(dailyTotals)}
Category breakdown: ${JSON.stringify(breakdown)}

OUTPUT STRUCTURE:
1. Spending behavior analysis
2. Financial health assessment
3. Risk signals (if any)
4. 3 concrete improvement recommendations
`;

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 500,
        }),
      }
    );

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error("Groq API error:", err);
      return res.status(500).json({
        insight: "AI backend unavailable.",
      });
    }

    const json = await groqRes.json();

    const text =
      json?.choices?.[0]?.message?.content ||
      "AI returned no usable output.";

    return res.status(200).json({ insight: text.trim() });

  } catch (err) {
    console.error("AI crash:", err);
    return res.status(500).json({
      insight: "AI system error.",
    });
  }
}
