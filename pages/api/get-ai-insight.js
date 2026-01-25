import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      mode,
      country,
      weeklyIncome,
      weeklySpend,
      dailyTotals,
      breakdown,
    } = req.body;

    /* ================================
       DATA QUALITY CHECK
    ================================= */

    const hasAnySpending = weeklySpend > 0;
    const nonZeroDays = dailyTotals.filter(v => v > 0).length;
    const dataQuality =
      nonZeroDays >= 3 ? "good" :
      nonZeroDays >= 1 ? "partial" :
      "low";

    /* ================================
       SYSTEM PROMPT (CORE BEHAVIOR)
    ================================= */

    const systemPrompt = `
You are a WEEKLY financial decision assistant.

Your job is NOT to educate in general finance.
Your job is to help the user decide what to do NEXT WEEK.

Rules:
- Focus on weekly behavior and short-term decisions.
- Be clear, calm, and non-judgmental.
- Avoid generic advice (no "consult a financial advisor").
- Do not speculate beyond the data.
- If data quality is low, clearly state limitations.
- Do NOT repeat obvious facts excessively.
- Keep answers concise but structured.

You must ALWAYS respond using this structure:

1. Weekly Snapshot
2. What This Means
3. Behavior Signal
4. Next Week Action Plan
5. 1-Month Outlook

The 1-Month Outlook MUST NOT go beyond 4 weeks.
If projection is unreliable, explain why.
`;

    /* ================================
       USER PROMPT (CONTEXT)
    ================================= */

    const userPrompt = `
Context:
- Mode: ${mode}
- Country: ${country}
- Weekly income: ${weeklyIncome}
- Weekly spending: ${weeklySpend}
- Daily totals: ${JSON.stringify(dailyTotals)}
- Category breakdown: ${JSON.stringify(breakdown)}
- Data quality: ${dataQuality}

Task:
Generate a WEEKLY financial intelligence response.
This is for a PAID weekly subscription.

Remember:
- The user wants clarity and next actions.
- Avoid unnecessary assumptions.
- If spending is zero or near zero, focus on data completeness.
- Include a realistic 1-month projection ONLY if data allows.
`;

    /* ================================
       OPENAI CALL
    ================================= */

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const insight = completion.choices[0].message.content;

    return res.status(200).json({ insight });

  } catch (err) {
    console.error("AI ERROR:", err);
    return res.status(500).json({
      insight: "AI analysis is temporarily unavailable. Please try again later.",
    });
  }
}
