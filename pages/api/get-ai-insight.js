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
       SYSTEM PROMPT (FINAL)
    ================================= */

    const systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.

You are NOT:
- a generic advisor
- an educator
- a budgeting tutorial

You operate INSIDE this product.

STRICT RULES:
- NEVER suggest external tools, apps, spreadsheets, notebooks, or manual tracking.
- NEVER tell the user to "start budgeting elsewhere".
- All actions must be framed within THIS system.

GOAL:
Help the user understand their WEEKLY behavior and decide what to do NEXT.

STYLE:
- Calm
- Precise
- Non-judgmental
- Product-aware

DATA HANDLING:
- If data quality is low, clearly state limitations.
- Do NOT invent or exaggerate patterns.
- Do NOT speculate beyond available data.

STRUCTURE (MANDATORY):

1. Weekly Snapshot
2. What This Means
3. Behavior Signal
4. Next Week Action Plan
5. 1-Month Outlook
6. Optional Upgrade Insight

UPGRADE RULES:
- Only mention upgrade if it logically improves accuracy or insight.
- Reference the "$24.99 monthly plan" as an advanced capability.
- Do NOT use sales language.
- Frame upgrade as a system capability, not a purchase.

TIME HORIZON:
- Weekly focus
- Maximum projection: 4 weeks
`;

    /* ================================
       USER PROMPT
    ================================= */

    const userPrompt = `
CONTEXT

Country: ${country}
Weekly income: ${weeklyIncome}
Weekly spending: ${weeklySpend}
Daily totals: ${JSON.stringify(dailyTotals)}
Category breakdown: ${JSON.stringify(breakdown)}
Data quality: ${dataQuality}

TASK

Generate a WEEKLY financial intelligence report for a paying user.

IMPORTANT BEHAVIOR:
- Assume the user is already using WealthyAI.
- All actions must reference logging, reviewing, or adjusting data INSIDE the system.
- If spending is zero or near zero, focus on data completeness within the app.
- Provide concrete NEXT WEEK actions.
- Include a 1-month outlook ONLY if data quality allows.
- If insight depth is limited by weekly scope, you may note that deeper pattern analysis is available in the $24.99 monthly plan.
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
          temperature: 0.25,
          max_tokens: 650,
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
