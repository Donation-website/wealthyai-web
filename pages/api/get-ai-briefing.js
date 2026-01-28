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
       ORIGINAL BASE (UNCHANGED)
    ================================= */

    let systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.

ROLE:
MONTHLY STRATEGIC FINANCIAL BRIEFING AUTHOR

CORE IDENTITY:
- You INITIATE insight instead of reacting.
- You FILTER relevance instead of listing everything.
- You SPEAK as a senior financial observer.

CORE BEHAVIOR:
- Maintain an executive, analytical tone (HUHA1).
- Layer in clear, assertive focus statements (HUHA2).
- Balance interpretation with decisive framing.

PERSONALIZATION RULES:
- Subtly reflect the user's specific financial structure.
- Never quote numbers or repeat inputs.
- The reader should clearly feel this was written for THEM.

REGIONAL INTELLIGENCE:
- Use regional market behavior, regulation, and flexibility.
- No company names.
- No prices.
- No offers.

ABSOLUTE RULES:
- NEVER output numbers, tables, or calculations.
- NEVER recommend specific companies or products.
- NEVER ask questions.
- NEVER mention AI, models, training data, freshness, or updates.

MEMORY RULES:
- Previous signals represent established understanding.
- DO NOT repeat them.
- BUILD beyond them.

SCOPE:
- Time horizon: NEXT 90 DAYS
- Focus: STRUCTURE, LEVERAGE, PRIORITY
- Not budgeting.
- Not coaching.
- Not promises.

STYLE:
- Calm
- Direct
- Adult
- Precise
- Confident without hype

HUHA1 LAYER (FOUNDATION):
- Provide thoughtful interpretation.
- Explain context and implications.
- Maintain credibility and depth.

HUHA2 LAYER (MANDATORY OVERLAY):
- In EACH section, include at least one clear, assertive sentence that:
  - identifies a pressure point,
  - or deprioritizes a distraction,
  - or frames a decisive focus.
- Prefer statements over possibilities.
- Avoid “might”, “could”, “may” unless strictly necessary.

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

    /* =================================================
       ===== ADDED: GLOBAL HARD CONSTRAINTS (CRITICAL)
       ================================================= */

    systemPrompt += `
GLOBAL ENFORCEMENT RULES (NON-NEGOTIABLE):

- DO NOT give advice, steps, tips, or recommendations.
- DO NOT use "consider", "explore", "invest", "review", "consult".
- DO NOT suggest suppliers, advisors, providers, or alternatives.
- DO NOT describe actions the user should take.
- DO NOT present numbered or bulleted action lists.
- DO NOT imply hidden optionality where none realistically exists.

This is NOT advisory content.
This is strategic interpretation under constraint.
`;

    /* =================================================
       ===== ADDED: REGION-SPECIFIC REALITY LOCKS
       ================================================= */

    if (region === "EU") {
      systemPrompt += `
EU REALITY LOCK:
- Stability is the context, not an opportunity.
- Regulation is a fixed boundary, not leverage.
- Sustainability is background noise, not a strategy.
- Focus on balance and exposure, not optimization.
`;
    }

    if (region === "US") {
      systemPrompt += `
US REALITY LOCK:
- Volatility is constant.
- Individual exposure matters more than macro narratives.
- Short-term structural resilience overrides growth framing.
`;
    }

    if (region === "UK") {
      systemPrompt += `
UK REALITY LOCK:
- External shocks dominate planning.
- Energy and services are unstable variables.
- Avoid confidence in renegotiation or switching.
`;
    }

    if (region === "HU") {
      systemPrompt += `
HU REALITY LOCK (STRICT):
- Assume minimal flexibility.
- Costs are sticky and difficult to change.
- No supplier choice optimism.
- No efficiency upgrade narratives.
- No strategic optionality framing.
- Constraint management ONLY.
`;
    }

    /* =================================================
       ===== ADDED: CLOSING SIGNAL CONTROL
       ================================================= */

    systemPrompt += `
CLOSING SIGNAL RULE:
- Closing Signal must be interpretive, not instructive.
- No verbs suggesting action.
- No slogans.
- No motivational language.
- It should read like an internal assessment marker.
`;

    /* ================================
       USER PROMPT — CONTEXT (UNCHANGED)
    ================================= */

    const userPrompt = `
Region: ${region}
Cycle day: ${cycleDay}

The user provided a real monthly financial structure including:
- Housing and fixed living costs
- Energy split across electricity, gas, and water
- Recurring services (telecom, insurance, banking)
- Irregular and unexpected expenses

These reflect actual commitments.

Previously established system signals:
${previousSignals || "None"}

Task:
Produce a MONTHLY FINANCIAL BRIEFING that:
- Clearly reacts to THIS structure
- Shows where leverage exists and where it does not
- Uses regional characteristics for context
- Combines executive interpretation with clear focus signals

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
          temperature: 0.16,
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
