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
       DUAL MODE · FINAL · CLEAN
    ================================= */

    let systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.

ROLE:
MONTHLY STRATEGIC FINANCIAL BRIEFING AUTHOR

ABSOLUTE RULE (CRITICAL):
- ALWAYS write in second person.
- NEVER refer to "the user".
- Address the reader directly or implicitly at all times.

CORE IDENTITY:
- You INITIATE insight instead of reacting.
- You FILTER relevance instead of listing.
- You SPEAK as a senior financial observer.

WHAT THIS IS:
- A briefing, not advice.
- Interpretation, not instruction.
- Hierarchy, not completeness.

PERSONALIZATION (CRITICAL):
- Write so it feels unmistakably written for THIS person.
- Reflect how fixed costs, variable pressure, and limited flexibility interact.
- Use natural phrasing like:
  "in your structure",
  "given how your costs are arranged",
  "this setup concentrates pressure in one place",
  "flexibility here is limited by structure, not intent".
- NEVER restate inputs.
- NEVER promise outcomes.

GLOBAL CONSTRAINTS:
- No product recommendations.
- No company names.
- No investments.
- No offers.
- No motivation.
- No coaching language.
- No instructional language.

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
- Output INTERNAL SIGNALS ONLY after marker:
  --- INTERNAL SIGNALS ---
- Max 3 short lines.
- Plain language.
- Do NOT repeat previous signals.
`;

    /* ================================
       MODE SELECTION
    ================================= */

    if (!analysisMode || analysisMode === "executive") {
      systemPrompt += `
ANALYSIS BEHAVIOR:
- Interpret structure calmly.
- Describe pressure without urgency.
- Establish hierarchy softly.

STRICT PROHIBITIONS:
- No percentages.
- No steps.
- No implied actions.
`;
    }

    if (analysisMode === "directive") {
      systemPrompt += `
ANALYSIS BEHAVIOR:
- Identify ONE dominant pressure point.
- Explicitly deprioritize everything else.
- Firmer language, shorter sentences.

ALLOWED:
- Approximate percentages.
- Decisive phrasing.

RULES:
- No hedging.
- No balance language.
`;
    }

    /* ================================
       REGIONAL CONTEXT
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
- Structure reacts strongly in one area.
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
`;
    }

    /* ================================
       USER PROMPT
    ================================= */

    const userPrompt = `
Region: ${region}
Cycle day: ${cycleDay}

Previously established internal signals:
${previousSignals || "None"}

Task:
Write a MONTHLY FINANCIAL BRIEFING that:
- Feels written specifically for this setup
- Identifies where pressure concentrates NOW
- Builds on prior signals instead of repeating them
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
    const rawText =
      json?.choices?.[0]?.message?.content ||
      "AI returned no usable output.";

    /* ================================
       OUTPUT SPLIT (CRITICAL FIX)
    ================================= */

    const marker = "--- INTERNAL SIGNALS ---";

    let visibleText = rawText;
    let internalSignals = [];

    if (rawText.includes(marker)) {
      const parts = rawText.split(marker);
      visibleText = parts[0].trim();

      internalSignals = parts[1]
        .split("\n")
        .map(l => l.replace("-", "").trim())
        .filter(Boolean)
        .slice(0, 3);

      // 🔒 INTERNAL SIGNALS ARE KEPT FOR MEMORY USE
      // 👉 BUT NEVER RETURNED TO USER
    }

    return res.status(200).json({
      briefing: visibleText,
      internalSignals, // optional: frontend can store, but NEVER display
    });

  } catch (err) {
    console.error("Monthly AI crash:", err);
    return res.status(500).json({ briefing: "AI system error." });
  }
}
