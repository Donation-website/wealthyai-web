export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ insight: "Method not allowed." });
  }

  try {
    const {
      mode = "weekly",
      country,
      weeklyIncome,
      weeklySpend,
      dailyTotals,
      breakdown,
    } = req.body;

    /* ================================
       INTERNAL DATA CHECK
    ================================= */

    const nonZeroDays = Array.isArray(dailyTotals)
      ? dailyTotals.filter(v => v > 0).length
      : 0;

    const dataQuality =
      nonZeroDays >= 3 ? "good" :
      nonZeroDays >= 1 ? "partial" :
      "low";

    /* ================================
       SYSTEM PROMPT (BEHAVIOR-FOCUSED)
    ================================= */

    const systemPrompt = `
You are WealthyAI, a PAID financial intelligence system.

You do NOT repeat obvious facts.
You do NOT act as a budgeting tutorial.
You do NOT issue generic alerts.

Your purpose:
- Identify BEHAVIORAL PATTERNS
- Translate them into DECISION SIGNALS

CRITICAL RULES:
- Behavior Signal MUST describe HOW the user spends, not HOW MUCH.
- Never restate income, spending, or ratios in the Behavior Signal.
- The Behavior Signal must add NEW understanding.

STYLE:
- Product-level language
- Calm, precise, non-judgmental
- No filler, no education tone

STRUCTURE (MANDATORY):

1. Weekly Snapshot (facts only, human-readable)
2. What This Means (why it matters)
3. Behavior Signal (pattern label + one sentence)
4. Next Week Action Plan (pattern-breaking steps inside WealthyAI)
5. Outlook
6. Optional Upgrade Insight (weekly mode only)
`;

    /* ================================
       USER PROMPT
    ================================= */

    const userPrompt = `
SUBSCRIPTION MODE: ${mode}
Country: ${country}
Weekly income: ${weeklyIncome}
Weekly spending: ${weeklySpend}
Internal data completeness: ${dataQuality}

TASK:
Generate a WEEKLY financial intelligence report.

IMPORTANT:
- Do NOT repeat numeric facts outside the Snapshot.
- Behavior Signal must explain the spending PATTERN.
- Action Plan must respond directly to that pattern.
- All actions occur inside WealthyAI.
- Mention the $24.99 monthly plan only if it resolves a limitation.
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
          temperature: 0.2,
          max_tokens: 620,
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
