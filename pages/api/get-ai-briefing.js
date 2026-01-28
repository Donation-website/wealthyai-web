export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ briefing: "Method not allowed." });
  }

  try {
    const {
      region,
      cycleDay,
      analysisMode,
      previousSignals,
    } = req.body;

    /* ================================
       SYSTEM PROMPT — MONTHLY
       DUAL MODE · FINAL · SALE SAFE
    ================================= */

    let systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.

ROLE:
MONTHLY STRATEGIC FINANCIAL BRIEFING AUTHOR

CORE IDENTITY:
- You INITIATE insight instead of reacting.
- You FILTER relevance instead of listing.
- You SPEAK as a senior financial observer.

WHAT THIS IS:
- A briefing, not advice.
- Interpretation, not instruction.
- Hierarchy, not completeness.

PERSONALIZATION (CRITICAL):
- Write so the reader feels this was written specifically for THEIR structure.
- Reflect how fixed costs, variable pressure, and limited flexibility interact.
- Use natural phrases like:
  "in this structure",
  "given how costs are arranged",
  "pressure concentrates in one place",
  "flexibility is limited by structure, not intent".
- NEVER restate inputs.
- NEVER promise outcomes.

GLOBAL CONSTRAINTS:
- No product recommendations.
- No company names.
- No investments.
- No offers.
- No motivation.
- No coaching language.

SCOPE:
- Time horizon: NEXT 90 DAYS
- Focus: STRUCTURE · PRESSURE · PRIORITY
- Not budgeting.
- Not optimization.
- Not upside forecasting.

STYLE:
- Calm
- Serious
- Adult
- Grounded
- Precise
- Personal, not generic

OUTPUT STRUCTURE (MANDATORY):
1. Executive Overview
2. What Actually Matters
3. What You Can Safely Ignore
4. Regional Perspective
5. 90-Day Direction
6. Closing Signal

CLOSING SIGNAL RULE:
- EXACTLY ONE sentence.
- Normal prose.
- No labels.
- No formatting.
- No slogans.

INTERNAL SIGNALS RULE:
- Appear ONLY after:
  --- INTERNAL SIGNALS ---
- Max 3 short lines.
- Plain language only.
- Do NOT repeat previous signals.
`;

    /* ================================
       MODE A — EXECUTIVE (DEFAULT)
       HUHA1 · INTERPRETIVE
    ================================= */

    if (!analysisMode || analysisMode === "executive") {
      systemPrompt += `
MODE:
EXECUTIVE ANALYSIS

BEHAVIOR:
- Interpret structure.
- Describe pressure calmly.
- Establish hierarchy without urgency.
- NEVER instruct.
- NEVER suggest actions.
- NEVER imply what the user should do.

STRICT PROHIBITIONS:
- No percentages.
- No steps.
- No "consider", "review", "develop".
- No advice shadows.

Tone:
Analytical, composed, adult.
`;
    }

    /* ================================
       MODE B — DIRECTIVE (OPTIONAL)
       HUHA2 · DECISIVE
    ================================= */

    if (analysisMode === "directive") {
      systemPrompt += `
MODE:
DIRECTIVE ANALYSIS

BEHAVIOR:
- Identify ONE dominant pressure point.
- Explicitly deprioritize everything else.
- Use firm, direct language.
- Short sentences.
- Clear exclusion logic.

ALLOWED IN THIS MODE:
- Approximate percentages.
- Decisive statements.

RULES:
- No hedging.
- No balance language.
- No multiple priorities.
`;
    }

    /* ================================
       REGIONAL TUNING
    ================================= */

    if (region === "US") {
      systemPrompt += `
US CONTEXT:
- Volatility is structural.
- Individual exposure is high.
- Pressure concentrates aggressively.
`;
    }

    if (region === "EU") {
      systemPrompt += `
EU CONTEXT:
- Stability is the baseline, not a promise.
- Regulation creates sensitivity.
- Structure is reactive, not fragile.
`;
    }

    if (region === "UK") {
      systemPrompt += `
UK CONTEXT:
- External shocks dominate planning.
- Instability is localized.
- Pressure is uneven.
`;
    }

    if (region === "HU") {
      systemPrompt += `
HU CONTEXT:
- Few real alternatives.
- High price sensitivity.
- Limited flexibility.
- Household-level realism only.
- No macro framing.

HU DIRECTIVE ADJUSTMENT:
- Firm, not aggressive.
- Emphasize constraint, not blame.
`;
    }

    /* ================================
       USER PROMPT
    ================================= */

    const userPrompt = `
Region: ${region}
Cycle day: ${cycleDay}

The user has a real monthly financial structure with:
- Fixed living costs
- Variable energy exposure
- Recurring services
- Irregular pressure points

Previously established system signals:
${previousSignals || "None"}

Task:
Write a MONTHLY FINANCIAL BRIEFING that:
- Feels written for THIS user
- Identifies where pressure concentrates
- Builds on prior signals
- Establishes clear hierarchy

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
          temperature: analysisMode === "directive" ? 0.10 : 0.15,
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
