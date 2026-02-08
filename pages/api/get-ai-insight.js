export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ insight: "Method not allowed." });
  }

  try {
    const {
      mode,
      country,
      weeklyIncome,
      weeklySpend,
      dailyTotals,
      breakdown,
      income,
      fixed,
      variable,
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
        PROMPTS
    ================================= */

    let systemPrompt = "";
    let userPrompt = "";
    let upgradeHint = "";

    /* ===== DAY MODE ===== */

    if (mode === "day") {
      systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.

MODE: DAILY FINANCIAL PULSE

ABSOLUTE RULES (CRITICAL):
- NEVER use the word "user".
- ALWAYS address the person directly as "You" or "Your".
- NEVER output raw numbers lists, arrays, JSON, or data dumps.
- NEVER repeat user input verbatim.
- NEVER show category tables or technical structures.
- ALL data must be summarized in natural language only.

SCOPE RULES:
- This is NOT a strategy session.
- This is NOT a long-term forecast.
- Maximum outlook: 7 days.

STRUCTURE (MAX 3 SECTIONS):
1. Your Daily Financial State
2. What This Means For You
3. Your 7-Day Direction

STYLE:
- Calm
- Professional
- Non-judgmental
- Personal and direct
`;

      userPrompt = `
Income: ${income}
Fixed costs: ${fixed}
Variable spending: ${variable}

Task:
Provide a DAILY financial pulse.
Address me directly as "You".
Summarize patterns in words.
Avoid any technical or raw data output.
`;

      upgradeHint = `
This daily snapshot works best as a short-term signal for you.
Weekly and Monthly views help you confirm patterns and provide forward-looking insight.
`;
    }

    /* ===== WEEK MODE ===== */

    if (mode === "week") {
      systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.

MODE: WEEKLY BEHAVIOR INTERPRETER

ABSOLUTE RULES (CRITICAL):
- NEVER use the word "user".
- ALWAYS address the person directly as "You" or "Your".
- NEVER output arrays, JSON, tables, or raw structures.
- NEVER echo daily totals or category objects.
- Summarize behavior patterns only.

GOAL:
Explain YOUR weekly behavior and guide your next step.

STRUCTURE (MANDATORY):
1. Your Weekly Snapshot (in words, no numbers list)
2. What This Means For You
3. Your Behavior Signal
4. Your Next Week Action Plan
5. Your 1-Month Outlook (only if data allows)
6. Optional System Capability Note

UPGRADE RULE:
- Mention advanced analysis only as a system capability.
- No pricing. No CTA. No sales tone.
`;

      userPrompt = `
Country: ${country}
Weekly income: ${weeklyIncome}
Weekly spending: ${weeklySpend}
Daily totals provided internally
Category data provided internally
Data quality: ${dataQuality}

Task:
Generate a WEEKLY intelligence report for ME.
DO NOT show raw data.
Interpret my behavior in personal natural language only.
`;

      upgradeHint = `
For deeper, country-adjusted projections and longer-term pattern detection for you,
the Monthly Intelligence tier expands your analysis beyond the weekly scope.
`;
    }

    /* ================================
        GROQ CALL
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
          max_tokens: mode === "day" ? 280 : 620,
        }),
      }
    );

    if (!groqRes.ok) {
      return res.status(500).json({ insight: "AI backend unavailable." });
    }

    const json = await groqRes.json();
    let text =
      json?.choices?.[0]?.message?.content ||
      "AI returned no usable output.";

    if (dataQuality === "good" && upgradeHint) {
      text += "\n\n" + upgradeHint.trim();
    }

    return res.status(200).json({ insight: text.trim() });

  } catch (err) {
    console.error("AI crash:", err);
    return res.status(500).json({ insight: "AI system error." });
  }
}
