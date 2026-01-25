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

    /* ================================
       DATA QUALITY CHECK
    ================================= */

    const nonZeroDays = Array.isArray(dailyTotals)
      ? dailyTotals.filter(v => v > 0).length
      : 0;

    const dataQuality =
      nonZeroDays >= 3 ? "good" :
      nonZeroDays >= 1 ? "partial" :
      "low";

    /* ================================
       SYSTEM PROMPT
    ================================= */

    const systemPrompt = `
You are a WEEKLY financial intelligence assistant.

This is a PAID product.
You are not a generic financial advisor.

Rules:
- Focus on WEEKLY behavior and NEXT actions.
- Be calm, clear, and non-judgmental.
- Avoid generic advice (no "consult a financial advisor").
- Do not speculate beyond the provided data.
- If data quality is low, clearly state limitations.
- Keep the response structured and concise.

Always use the following structure:

1. Weekly Snapshot
2. What This Means
3. Behavior Signal
4. Next Week Action Plan
5. 1-Month Outlook

The 1-Month Outlook MUST NOT exceed 4 weeks.
If projection is unreliable, explain why clearly.
`;

    /* ================================
       USER PROMPT
    ================================= */

    const userPrompt = `
DATASET

Country: ${country}
Weekly income: ${weeklyIncome}
Weekly spending: ${weeklySpend}
Daily totals: ${JSON.stringify(dailyTotals)}
Category breakdown: ${JSON.stringify(breakdown)}
Data quality: ${dataQuality}

TASK

Generate a WEEKLY financial intelligence report.

Important:
- This is for a weekly subscription.
- The user wants clarity and direction.
- If spending is zero or very low, focus on data completeness.
- Provide concrete next-week actions.
- Only include a 1-month outlook if data quality allows.
`;

    /* ================================
       GROQ API CALL
    ================================= */

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 550,
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
