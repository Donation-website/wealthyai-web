export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ briefing: "Method not allowed." });
  }

  try {
    const {
      region,
      cycleDay,
      previousSignals,
      income,
      housing,
      electricity,
      gas,
      water,
      internet,
      mobile,
      tv,
      insurance,
      banking,
      unexpected,
      other,
    } = req.body;

    /* ================================
       SYSTEM PROMPT — MONTHLY (E)
    ================================= */

    const systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.

ROLE:
MONTHLY STRATEGIC FINANCIAL BRIEFING AUTHOR

CORE IDENTITY:
- You INITIATE insight instead of reacting.
- You FILTER relevance instead of listing everything.
- You SPEAK as a senior financial observer.

CRITICAL BEHAVIOR RULES:
- Subtly reference the user's financial structure without quoting numbers.
- Make it clear the analysis is based on THIS user's setup.
- Use regional market knowledge (competition, regulation, flexibility),
  NOT company names, prices, or offers.
- Avoid macro commentary unless it affects decisions.

ABSOLUTE RULES:
- NEVER output numbers, tables, or calculations.
- NEVER repeat user inputs verbatim.
- NEVER recommend specific companies.
- NEVER ask questions.
- NEVER mention AI, models, training, freshness, or updates.

MEMORY RULES:
- Previous signals represent already established insights.
- DO NOT repeat them.
- BUILD on them or move beyond them.

SCOPE:
- Time horizon: NEXT 90 DAYS
- Focus: STRUCTURE and LEVERAGE
- Not budgeting, not coaching, not promises.

STYLE:
- Calm
- Direct
- Adult
- Confident but not alarmist

OUTPUT STRUCTURE (MANDATORY):
1. Executive Overview
2. What Actually Matters
3. What You Can Safely Ignore
4. Regional Perspective
5. 90-Day Direction
6. Closing Signal

END THE OUTPUT WITH:

--- INTERNAL SIGNALS ---
- short signal 1
- short signal 2
(max 3 signals, no repetition of previous ones)
`;

    /* ================================
       USER PROMPT — CONTEXT
    ================================= */

    const userPrompt = `
Region: ${region}
Cycle day: ${cycleDay}

The user provided a real monthly financial structure including:
- Housing and living costs
- Energy split across electricity, gas, and water
- Recurring services (telecom, insurance, banking)
- Irregular and unexpected expenses

This reflects actual commitments.

Previously established system signals:
${previousSignals || "None"}

Task:
Produce a MONTHLY FINANCIAL BRIEFING that:
- Clearly reacts to this specific structure
- Shows where flexibility exists and where it does not
- Uses regional market characteristics
- Focuses attention for the next 90 days

Do NOT generalize unnecessarily.
Do NOT restate inputs.
`;

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
          temperature: 0.18,
          max_tokens: 950,
        }),
      }
    );

    if (!groqRes.ok) {
      return res.status(500).json({ briefing: "AI backend unavailable." });
    }

    const json = await groqRes.json();
    const text =
      json?.choices?.[0]?.message?.content ||
      "AI returned no usable output.";

    return res.status(200).json({ briefing: text.trim() });

  } catch (err) {
    console.error("Monthly AI crash:", err);
    return res.status(500).json({ briefing: "AI system error." });
  }
}
