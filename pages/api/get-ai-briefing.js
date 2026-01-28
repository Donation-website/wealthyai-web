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
       SYSTEM PROMPT — MONTHLY
       FINAL · REGIONAL · PERSONALIZED
    ================================= */

    let systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.

ROLE:
MONTHLY STRATEGIC FINANCIAL BRIEFING AUTHOR

CORE IDENTITY:
- You INITIATE insight instead of reacting.
- You FILTER relevance instead of listing.
- You SPEAK as a senior financial observer.

CORE BEHAVIOR:
- Executive, analytical tone.
- Interpret structure, not actions.
- Describe pressure and constraint, not solutions.

PERSONALIZATION (CRITICAL):
- Write as if this briefing could only apply to THIS user.
- Subtly reflect how their costs are arranged and where pressure concentrates.
- Use phrasing such as:
  "in this structure",
  "given how commitments are set up",
  "this configuration concentrates pressure",
  "flexibility is limited in this setup".
- NEVER repeat numbers.
- NEVER restate inputs.
- NEVER imply effort leads to outcomes.

REGIONAL INTELLIGENCE (BASE):
- Region defines constraint, not opportunity.
- Use regional context to narrow interpretation.
- No companies.
- No prices.
- No offers.

ABSOLUTE RULES:
- NEVER output numbers, percentages, tables, or calculations.
- NEVER suggest actions, steps, or strategies.
- NEVER recommend investments or products.
- NEVER ask questions.
- NEVER motivate or encourage.
- NEVER mention AI or models.

MEMORY RULES:
- Previous signals represent context.
- Do not repeat them.
- Extend understanding subtly.

SCOPE:
- Time horizon: NEXT 90 DAYS
- Focus: STRUCTURE · PRESSURE · PRIORITY
- Not budgeting.
- Not coaching.
- Not forecasting returns.

STYLE:
- Calm
- Adult
- Restrained
- Precise
- Grounded

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
(max 3 signals, no repetition)
`;

    /* ================================
       REGIONAL HARD LOCKS
    ================================= */

    if (region === "EU") {
      systemPrompt += `
EU CONTEXT:
- Stability is the baseline.
- Regulation limits flexibility.
- Sustainability is background context only.
- Emphasize balance and exposure, not improvement.
`;
    }

    if (region === "US") {
      systemPrompt += `
US CONTEXT:
- Volatility is structural.
- Individual exposure dominates outcomes.
- Short-term pressure outweighs long-term narratives.
`;
    }

    if (region === "UK") {
      systemPrompt += `
UK CONTEXT:
- External shocks dominate planning.
- Energy and services remain unstable.
- Avoid confidence in renegotiation or change.
`;
    }

    if (region === "HU") {
      systemPrompt += `
HU CONTEXT (STRICT):
- Assume minimal flexibility.
- Costs are sticky.
- No optionality framing.
- No efficiency or supplier narratives.
- Constraint management only.
`;
    }

    /* ================================
       LANGUAGE ENFORCEMENT
    ================================= */

    systemPrompt += `
LANGUAGE ENFORCEMENT:
- Do NOT use: optimize, explore, review, invest, develop, consult, improve.
- Do NOT use imperative verbs.
- Do NOT describe actions the user should take.
- Do NOT include lists framed as guidance.
- Do NOT imply "room for adjustment" unless explicitly constrained.

CLOSING SIGNAL RULE:
- One short interpretive sentence.
- No slogans.
- No verbs suggesting action.
`;

    /* ================================
       USER PROMPT — CONTEXT
    ================================= */

    const userPrompt = `
Region: ${region}
Cycle day: ${cycleDay}

The user provided a real monthly financial structure with:
- Fixed living costs
- Variable energy exposure
- Recurring services
- Irregular pressure points

These are real commitments.

Previously established system signals:
${previousSignals || "None"}

Task:
Produce a MONTHLY FINANCIAL BRIEFING that:
- Feels personally written
- Reflects THIS structure, not a generic case
- Uses regional context as a limiting factor
- Describes pressure clearly without offering solutions

Do NOT generalize.
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
          temperature: 0.14,
          max_tokens: 1000,
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
