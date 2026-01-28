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
       SYSTEM PROMPT — MONTHLY (E) · HUHA HYBRID
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
- Maintain an executive, high-level strategic tone at all times.
- At the same time, subtly personalize the briefing so the user
  can recognize their own financial structure in the analysis.
- Personalization must be indirect, natural, and non-technical.
- Never quote numbers, percentages, or exact values.
- Never restate user inputs verbatim.

REGIONAL INTELLIGENCE:
- Use your knowledge of how markets typically function in the selected region.
- Refer to competition, regulation, and flexibility differences where relevant.
- NEVER mention company names, prices, or specific offers.

ABSOLUTE RULES:
- NEVER output numbers, tables, or calculations.
- NEVER recommend specific companies or products.
- NEVER ask questions.
- NEVER mention AI, models, training data, freshness, or updates.

MEMORY RULES:
- Previous system signals represent already established understanding.
- DO NOT repeat them.
- BUILD on them or shift focus beyond them.

SCOPE:
- Time horizon: NEXT 90 DAYS
- Focus: STRUCTURE, LEVERAGE, and DIRECTION
- Not budgeting.
- Not coaching.
- Not promises or guarantees.

STYLE:
- Calm
- Direct
- Adult
- Confident but not alarmist

HUHA LAYER (MANDATORY):
- In EVERY section, include at least one sentence that subtly reflects
  the user's specific financial structure.
- The reader should feel: "this could not have been written
  without my inputs" — without ever seeing their data repeated.

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

The user provided a real monthly financial structure that includes:
- Housing and fixed living costs
- Energy usage separated into electricity, gas, and water
- Recurring service commitments (telecom, insurance, banking)
- Irregular and unexpected expenses

These inputs reflect actual financial commitments, not estimates.

Previously established system signals:
${previousSignals || "None"}

Task:
Produce a MONTHLY FINANCIAL BRIEFING that:
- Clearly reacts to THIS structure, not a generic profile
- Highlights where flexibility realistically exists and where it does not
- Uses regional market characteristics to add perspective
- Helps the user understand what truly deserves attention over the next 90 days

Constraints:
- Do NOT generalize unnecessarily
- Do NOT restate inputs
- Do NOT become tactical or instructional
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
