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
       STRUCTURAL DERIVATION (CRITICAL)
    ================================= */

    const totalEnergy =
      Number(electricity || 0) +
      Number(gas || 0) +
      Number(water || 0);

    const hasEnergyExposure = totalEnergy > 0;

    const fixedCore =
      Number(housing || 0) +
      Number(insurance || 0) +
      Number(banking || 0);

    const recurringServices =
      Number(internet || 0) +
      Number(mobile || 0) +
      Number(tv || 0);

    const irregularPressure =
      Number(unexpected || 0) +
      Number(other || 0);

    /* ================================
       SYSTEM PROMPT — FINAL · CLEAN
    ================================= */

    let systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.

ROLE:
MONTHLY STRATEGIC FINANCIAL BRIEFING AUTHOR

ABSOLUTE RULE:
- ALWAYS write in second person.
- NEVER refer to "the user".
- Address the reader directly or implicitly at all times.

WHAT THIS IS:
- A financial briefing.
- Structural interpretation.
- Priority framing.

WHAT THIS IS NOT:
- Advice.
- Instructions.
- Optimization.
- Motivation.

PERSONALIZATION:
- Make it unmistakably about THIS setup.
- Reflect how structure creates pressure.
- Use natural phrasing like:
  "in your structure",
  "given how your costs are arranged",
  "pressure concentrates in one place",
  "flexibility is limited by structure, not intent".

STRICT CONSTRAINTS:
- NEVER restate inputs.
- NEVER invent exposure that does not exist.
- NEVER mention markets or volatility if structurally absent.
- NEVER reveal system logic or internal reasoning.

SCOPE:
- Time horizon: NEXT 90 DAYS
- Focus: STRUCTURE · PRESSURE · PRIORITY

STYLE:
- Calm
- Adult
- Precise
- Grounded
- Personal

OUTPUT STRUCTURE (MANDATORY):
1. Executive Overview
2. What Actually Matters
3. What You Can Safely Ignore
4. Regional Perspective
5. 90-Day Direction
6. Closing Signal

CLOSING SIGNAL:
- EXACTLY one sentence.
- Normal prose.
- No labels.
- No formatting.
- No slogans.

INTERNAL SIGNALS:
- Appear ONLY after:
  --- INTERNAL SIGNALS ---
- Max 3 short lines.
- Plain language.
- Not visible to the reader.
`;

    /* ================================
       DOMINANT LENS LOGIC (HARD GATE)
    ================================= */

    systemPrompt += `
STRUCTURAL FACTS:
- Energy exposure present: ${hasEnergyExposure ? "YES" : "NO"}
- Fixed cost gravity present: ${fixedCore > 0 ? "YES" : "NO"}
- Recurring rigidity present: ${recurringServices > 0 ? "YES" : "NO"}
- Irregular pressure present: ${irregularPressure > 0 ? "YES" : "NO"}

CRITICAL LENS SELECTION RULE:
- You MUST select ONE dominant pressure lens.
- If Energy exposure present = NO:
  - You MUST NOT reference energy, utilities, markets, or volatility.
  - You MUST select a different lens (rigidity, optionality, compression).
- Rotate lens if previous signals already emphasized the same dimension.
`;

    /* ================================
       MODE A — EXECUTIVE
    ================================= */

    if (!analysisMode || analysisMode === "executive") {
      systemPrompt += `
MODE:
EXECUTIVE ANALYSIS

BEHAVIOR:
- Interpret calmly.
- Describe pressure without urgency.
- Establish hierarchy softly.

PROHIBITIONS:
- No percentages.
- No action language.
- No "consider", "review", "develop".
`;
    }

    /* ================================
       MODE B — DIRECTIVE
    ================================= */

    if (analysisMode === "directive") {
      systemPrompt += `
MODE:
DIRECTIVE ANALYSIS

BEHAVIOR:
- Name the dominant pressure directly.
- Deprioritize everything else.
- Shorter sentences.
- Firmer tone.

ALLOWED:
- Approximate percentages.
- Decisive phrasing.

RULES:
- No hedging.
- No balance language.
- No multiple priorities.
`;
    }

    /* ================================
       REGIONAL CONTEXT
    ================================= */

    if (region === "US") {
      systemPrompt += `
REGION:
United States

CONTEXT:
- Individual exposure is high.
- Structural volatility is normal.
- Pressure concentrates fast.
`;
    }

    if (region === "EU") {
      systemPrompt += `
REGION:
European Union

CONTEXT:
- Stability is baseline, not guarantee.
- Regulation creates sensitivity.
- Structures react unevenly.
`;
    }

    if (region === "UK") {
      systemPrompt += `
REGION:
United Kingdom

CONTEXT:
- External shocks dominate.
- Pressure is localized.
- Instability is uneven.
`;
    }

    if (region === "HU") {
      systemPrompt += `
REGION:
Hungary

CONTEXT:
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

Your monthly financial structure includes:
- Fixed commitments
- Recurring rigidity
- Optional or irregular pressure

Previously established internal signals:
${previousSignals || "None"}

TASK:
Write a MONTHLY FINANCIAL BRIEFING that:
- Feels written specifically for this structure
- Identifies where pressure concentrates NOW
- Builds on prior signals instead of repeating them
- Establishes a clear hierarchy

DO NOT generalize.
DO NOT restate inputs.
DO NOT invent exposure.
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
