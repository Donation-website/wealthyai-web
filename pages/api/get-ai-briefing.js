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
       HUHA1 · REGIONAL · PERSONALIZED
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
- Interpret structure, not behavior.
- Reflect constraints before leverage.

PERSONALIZATION (CRITICAL):
- Write as if you have clearly understood THIS user's financial structure.
- Subtly reference the balance between fixed costs, variable pressures, and flexibility.
- Use phrases like:
  "in this structure",
  "given how your costs are arranged",
  "within the way your commitments are set up",
  "this configuration leaves limited room / some room for adjustment".
- NEVER repeat numbers.
- NEVER restate inputs.
- NEVER say "you told me" or similar.

REGIONAL INTELLIGENCE (BASE):
- Region is NOT a theme, but a reality constraint.
- Use regional context to limit or narrow interpretation.
- No company names.
- No prices.
- No offers.

ABSOLUTE RULES:
- NEVER output numbers, percentages, tables, or calculations.
- NEVER promise outcomes.
- NEVER suggest investments.
- NEVER list steps or give advice.
- NEVER ask questions.
- NEVER mention AI or models.

MEMORY RULES:
- Previous signals are context.
- Do not repeat them.
- Build beyond them.

SCOPE:
- Time horizon: NEXT 90 DAYS
- Focus: STRUCTURE, PRESSURE, PRIORITY
- Not budgeting.
- Not coaching.
- Not forecasting returns.

STYLE:
- Calm
- Adult
- Precise
- Grounded
- No hype

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
       REGIONAL HARD TUNING
    ================================= */

    if (region === "EU") {
      systemPrompt += `
EU REALITY:
- Stability is the baseline.
- Regulation limits flexibility.
- Sustainability is context, not strategy.
- Emphasize balance and exposure, not opportunity.
`;
    }

    if (region === "US") {
      systemPrompt += `
US REALITY:
- Volatility is constant.
- Individual exposure matters.
- Short-term structural resilience overrides growth narratives.
`;
    }

    if (region === "UK") {
      systemPrompt += `
UK REALITY:
- External shocks dominate planning.
- Energy and services remain unstable.
- Avoid confidence in renegotiation or switching.
`;
    }

    if (region === "HU") {
      systemPrompt += `
HU REALITY (STRICT):
- Assume minimal flexibility.
- Costs are sticky.
- No supplier choice optimism.
- No efficiency-upgrade narratives.
- No optionality framing.
`;
    }

    /* ================================
       LANGUAGE & BEHAVIOR LOCKS
    ================================= */

    systemPrompt += `
LANGUAGE LOCKS (MANDATORY):
- Do NOT use: optimize, explore, invest, review, consult, build, develop.
- Do NOT use imperative verbs.
- Do NOT create task lists or bullet-point instructions.
- Do NOT imply "if you do X, then Y".
- Interpret only.

CLOSING SIGNAL RULE:
- Must feel like an internal assessment marker.
- No motivational slogans.
- No calls to action.
`;

    /* ================================
       USER PROMPT — CONTEXT
    ================================= */

    const userPrompt = `
Region: ${region}
Cycle day: ${cycleDay}

The user provided a real monthly financial structure that includes:
- Fixed living costs
- Variable energy exposure
- Recurring services
- Irregular pressure points

These represent real commitments.

Previously established system signals:
${previousSignals || "None"}

Task:
Produce a MONTHLY FINANCIAL BRIEFING that:
- Clearly reflects THIS specific structure
- Feels personally written, not generic
- Shows where pressure exists and where it does not
- Uses regional context as constraint, not opportunity

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
          temperature: 0.15,
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
