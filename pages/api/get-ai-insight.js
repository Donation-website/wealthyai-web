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
       DATA QUALITY (INTERNAL ONLY)
    ================================= */

    const nonZeroDays = Array.isArray(dailyTotals)
      ? dailyTotals.filter(v => v > 0).length
      : 0;

    const dataQuality =
      nonZeroDays >= 3 ? "good" :
      nonZeroDays >= 1 ? "partial" :
      "low";

    /* ================================
       SYSTEM PROMPT (STRICT)
    ================================= */

    const systemPrompt = `
You are WealthyAI, a PAID financial intelligence product.

You are writing USER-FACING PRODUCT OUTPUT.
This is NOT a technical report.

ABSOLUTE PROHIBITIONS:
- NEVER show raw data arrays, JSON, category objects, or internal flags.
- NEVER mention "daily totals", "category breakdown", or "data quality".
- NEVER provide generic budgeting advice.
- NEVER suggest meal planning, daily budgeting, or external tools.

STYLE RULES:
- Clear, human, product-level language.
- Short sections.
- No filler.
- No education tone.

BEHAVIOR SIGNAL RULES:
- EXACTLY one short label (2–4 words).
- EXACTLY one explanatory sentence.
- No analysis here.

STRUCTURE (MANDATORY):

1. Weekly Snapshot (human summary, max 4 bullet points)
2. What This Means (short interpretation)
3. Behavior Signal (label + one sentence)
4. Next Week Action Plan (3 concise platform-specific steps)
5. Outlook
6. Optional Upgrade Insight (weekly mode only)

TIME RULES:
- Weekly mode: outlook max 4 weeks
- Monthly mode: broader trends allowed
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
Generate a FINANCIAL INTELLIGENCE SUMMARY for a paying user.

IMPORTANT:
- Translate raw data into USER MEANING.
- Hide all internal data representations.
- Focus on clarity, not completeness.
- All actions must happen inside WealthyAI.
- If insight depth is limited, explain limitation calmly.

UPGRADE LOGIC:
- Only mention the $24.99 monthly plan if it directly solves a limitation.
- No feature lists. No sales tone.
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
          temperature: 0.22,
          max_tokens: 600,
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
