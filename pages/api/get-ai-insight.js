export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ insight: "Method not allowed." });
  }

  try {
    const {
      mode = "weekly", // "weekly" | "monthly"
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
       SYSTEM PROMPT (FINAL, LOCKED)
    ================================= */

    const systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.

You operate INSIDE this product.
You are NOT a generic advisor, coach, or tutorial.

ABSOLUTE RULES:
- NEVER suggest external tools, apps, spreadsheets, notebooks, or manual tracking.
- NEVER tell the user to use another system.
- ALL actions must be framed within THIS platform.

STYLE:
- Calm
- Precise
- Product-aware
- Non-judgmental
- No filler text

BEHAVIOR SIGNAL RULES:
- Must be a SHORT LABEL (2–4 words)
- Followed by ONE explanatory sentence
- No speculation
- No moral judgment

STRUCTURE (MANDATORY):

1. Weekly Snapshot
2. What This Means
3. Behavior Signal
4. Next Week Action Plan
5. Outlook
6. Optional Upgrade Insight (WEEKLY ONLY)

TIME HORIZON RULES:
- Weekly mode: max 4-week outlook
- Monthly mode: broader trends allowed
- NEVER exceed allowed horizon
`;

    /* ================================
       USER PROMPT (MODE-AWARE)
    ================================= */

    const userPrompt = `
CONTEXT

Subscription mode: ${mode}
Country: ${country}
Weekly income: ${weeklyIncome}
Weekly spending: ${weeklySpend}
Daily totals: ${JSON.stringify(dailyTotals)}
Category breakdown: ${JSON.stringify(breakdown)}
Data quality: ${dataQuality}

TASK

Generate a financial intelligence report based on the subscription mode.

MODE RULES:

IF mode = "weekly":
- Focus on NEXT WEEK decisions
- Keep insights tactical
- Outlook limited to 1 month maximum
- If insight depth is limited, you MAY mention that deeper pattern analysis is available in the $24.99 monthly plan
- Upgrade mention must be optional and non-salesy

IF mode = "monthly":
- Assume user already has full access
- Focus on behavior trends and stability
- NO upgrade mentions
- Outlook may reference longer-term tendencies without numeric forecasts beyond provided data

IMPORTANT:
- Assume the user is already using this system
- Do not suggest reminders, apps, or external processes
- If data quality is low, clearly state limitations and focus on completion inside the platform
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
          max_tokens: 700,
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
