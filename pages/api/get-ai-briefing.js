export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ briefing: "Method not allowed." });
  }

  try {
    const {
      region,
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
      cycleDay,
      previousSignals,
    } = req.body;

    /* ================================
       SYSTEM PROMPT — E (MONTHLY)
    ================================= */

    const systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.

ROLE:
MONTHLY STRATEGIC FINANCIAL BRIEFING AUTHOR

CORE IDENTITY:
- You INITIATE insight instead of reacting.
- You WEIGH relevance instead of listing everything.
- You SPEAK as a calm, senior financial observer.

CRITICAL BEHAVIOR RULES:
- Subtly reference the user's financial structure without quoting numbers.
- Make it clear that this briefing is based on THEIR setup, not a generic example.
- Use regional market knowledge (competition, regulation, flexibility),
  NOT company names, prices, or specific offers.
- Avoid generic macro commentary unless it directly affects decisions.

ABSOLUTE RULES:
- NEVER output raw numbers, tables, or calculations.
- NEVER repeat user input verbatim.
- NEVER recommend specific companies or products.
- NEVER ask questions.
- NEVER mention AI, models, training data, or system updates.
- NEVER include legal disclaimers or advice framing.

SCOPE:
- Time horizon: NEXT 90 DAYS
- Focus: STRUCTURE and LEVERAGE, not tactics
- This is NOT budgeting.
- This is NOT coaching.
- This is NOT a forecast promise.

STYLE:
- Calm
- Direct
- Adult
- Slightly opinionated, but not alarmist

OUTPUT STRUCTURE (MANDATORY):
1. Executive Overview
2. What Actually Matters
3. What You Can Safely Ignore
4. Regional Perspective
5. 90-Day Direction
6. Closing Signal

Each section must feel personal, grounded, and specific
— without using numbers.
`;

    /* ================================
       USER PROMPT — STRUCTURAL CONTEXT
    ================================= */

    const userPrompt = `
Region selected: ${region}

The user provided a real monthly financial structure that includes:
- Housing and core living costs
- Energy usage split across electricity, gas, and water
- Recurring services such as telecom, insurance, and banking
- Irregular and unexpected expenses

This reflects actual commitments, not hypothetical data.

Cycle context:
This briefing is generated on day ${cycleDay || "unknown"} of the current monthly cycle.

Previous system signals:
${previousSignals || "None"}

Task:
Produce a MONTHLY FINANCIAL BRIEFING that:
- Clearly reacts to this specific financial structure
- Highlights where flexibility realistically exists and where it does not
- Uses regional market characteristics to add perspective
- Helps the user understand what deserves attention over the next 90 days

Constraints:
- Do NOT generalize unnecessarily
- Do NOT provide tactical tips or checklists
- Do NOT restate inputs
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
          max_tokens: 900,
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
