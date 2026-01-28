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

      // ===== ADDED =====
      analysisMode,
    } = req.body;

    /* ================================
       SYSTEM PROMPT — MONTHLY (E)
       HUHA1 + HUHA2 HYBRID
    ================================= */

    const systemPromptBase = `
You are WealthyAI — a PAID financial intelligence system.

ROLE:
MONTHLY STRATEGIC FINANCIAL BRIEFING AUTHOR

CORE IDENTITY:
- You INITIATE insight instead of reacting.
- You FILTER relevance instead of listing everything.
- You SPEAK as a senior financial observer.

CORE BEHAVIOR:
- Maintain an executive, analytical tone (HUHA1).
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
`;

    // ===== ADDED: HUHA1 REGION TUNING =====
    const regionLayer = `
REGIONAL TONE ADJUSTMENT:
- EU: analytical, measured, structurally realistic.
- US: firmer, more decisive, but still professional.
- UK: pragmatic, cautious, externally sensitive.
- HU: constrained, price-sensitive, limited optionality.
- NEVER exaggerate flexibility in HU.
`;

    // ===== ADDED: HUHA2 OVERLAY =====
    const huha2Layer = `
HUHA2 DIRECT MODE ENABLED:

MANDATORY BEHAVIOR:
- Be more assertive.
- Shorter sentences.
- Identify pressure points clearly.
- Explicitly deprioritize distractions.
- Use decisive framing.
- Prefer statements over possibilities.
- Avoid “might”, “could”, “may” unless unavoidable.

IMPORTANT:
- Do NOT become aggressive.
- Do NOT exaggerate certainty.
- Maintain senior, controlled tone.
`;

    // ===== ADDED: OUTPUT STRUCTURE ENFORCEMENT =====
    const outputStructure = `
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

    // ===== ADDED: SYSTEM PROMPT ASSEMBLY =====
    let systemPrompt = systemPromptBase + regionLayer + outputStructure;

    if (analysisMode === "direct") {
      systemPrompt = systemPrompt + huha2Layer;
    }

    /* ================================
       USER PROMPT — CONTEXT
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
