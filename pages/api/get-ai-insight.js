export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ insight: "Method not allowed." });
  }

  try {
    const {
      mode, // "day" | "week"
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

STRICT RULES:
- This is NOT a strategy session.
- This is NOT a long-term forecast.
- Do NOT mention months or yearly outcomes.
- Do NOT ask questions.

GOAL:
Give clarity about TODAY and a short-term (max 7-day) direction.

OUTPUT LIMITS:
- Max 3 short sections.
- Calm, reassuring, precise.

STRUCTURE:
1. Today's Financial State
2. What This Means
3. 7-Day Direction

STYLE:
- Calm
- Grounded
- Non-judgmental
`;

      userPrompt = `
CONTEXT

Income: ${income}
Fixed costs: ${fixed}
Variable spending: ${variable}

TASK

Provide a DAILY financial pulse.
Include a conservative 7-day direction if reasonable.
Focus only on immediately controllable factors.
Avoid speculation.
`;

      upgradeHint = `
This daily snapshot works best as a short-term signal.
Weekly and Monthly views allow confirmation of patterns and forward-looking insight.
`;
    }

    /* ===== WEEK MODE ===== */

    if (mode === "week") {
      systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.

MODE: WEEKLY BEHAVIOR INTERPRETER

STRICT RULES:
- NOT a generic advisor.
- NOT a budgeting tutorial.
- Operate strictly inside this system.

GOAL:
Help the user understand WEEKLY behavior and decide what to do NEXT.

DATA HANDLING:
- State limitations clearly if data quality is low.
- Do NOT exaggerate or invent patterns.

STRUCTURE (MANDATORY):
1. Weekly Snapshot
2. What This Means
3. Behavior Signal
4. Next Week Action Plan
5. 1-Month Outlook
6. Optional System Capability Note

UPGRADE RULE:
- Mention advanced analysis ONLY as a system capability.
- Do NOT use sales language.

TIME HORIZON:
- Weekly behavior
- Max projection: 1 month
`;

      userPrompt = `
CONTEXT

Country: ${country}
Weekly income: ${weeklyIncome}
Weekly spending: ${weeklySpend}
Daily totals: ${JSON.stringify(dailyTotals)}
Category breakdown: ${JSON.stringify(breakdown)}
Data quality: ${dataQuality}

TASK

Generate a WEEKLY financial intelligence report.
Provide concrete next-week actions.
Include a 1-month outlook only if data quality allows.
`;

      upgradeHint = `
For deeper, country-adjusted projections and longer-term pattern detection,
the Monthly Intelligence tier expands this analysis beyond the weekly scope.
`;
    }

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
          max_tokens: mode === "day" ? 300 : 650,
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

    // 🔑 DISCREET UPGRADE HINT (ONLY IF DATA IS GOOD)
    if (dataQuality === "good" && upgradeHint) {
      text += "\n\n" + upgradeHint.trim();
    }

    return res.status(200).json({ insight: text.trim() });

  } catch (err) {
    console.error("AI crash:", err);
    return res.status(500).json({ insight: "AI system error." });
  }
}
