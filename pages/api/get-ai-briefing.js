export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ briefing: "Method not allowed." });
  }

  try {
    const {
      region,
      cycleDay,
      analysisMode, // opcionális, backward compatibility
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
       INPUT SANITIZATION (HARD)
    ================================= */

    const safe = (v) => Math.max(0, Number(v || 0));

    const S = {
      income: safe(income),
      housing: safe(housing),
      electricity: safe(electricity),
      gas: safe(gas),
      water: safe(water),
      internet: safe(internet),
      mobile: safe(mobile),
      tv: safe(tv),
      insurance: safe(insurance),
      banking: safe(banking),
      unexpected: safe(unexpected),
      other: safe(other),
    };

    /* ================================
       STRUCTURAL DERIVATION (CRITICAL)
    ================================= */

    const totalEnergy = S.electricity + S.gas;
    const hasEnergyExposure = totalEnergy > 0;

    const fixedCore =
      S.housing +
      S.insurance +
      S.banking;

    const recurringServices =
      S.internet +
      S.mobile +
      S.tv;

    const irregularPressure =
      S.unexpected +
      S.other;

    /* ================================
       SYSTEM PROMPT — BASE (COMMON)
    ================================= */

    let systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.

ROLE:
MONTHLY STRATEGIC FINANCIAL BRIEFING AUTHOR

ABSOLUTE RULE:
- ALWAYS write in second person.
- NEVER refer to "the user".
- Address the reader directly or implicitly at all times.

CRITICAL VISIBILITY RULE:
- ANY content after the marker "--- INTERNAL SIGNALS ---" is FOR INTERNAL USE ONLY.
- It MUST NOT appear in the visible briefing under any circumstance.

WHAT THIS IS:
- A financial briefing.
- Structural interpretation.
- Priority framing.

WHAT THIS IS NOT:
- Advice.
- Instructions.
- Optimization.
- Motivation.

STRUCTURE DEFINITIONS (NON-NEGOTIABLE):
- Energy exposure = electricity + gas ONLY.
- Water is NOT energy.
- If energy exposure = 0 → energy MUST NOT be referenced.
- Zero or negative values mean ABSENCE, not low presence.

STRICT CONSTRAINTS:
- NEVER restate inputs.
- NEVER invent exposure.
- NEVER infer sectors that are structurally absent.
- NEVER reveal system logic.

SCOPE:
- Time horizon: NEXT 90 DAYS
- Focus: STRUCTURE · PRESSURE · PRIORITY

OUTPUT STRUCTURE (MANDATORY):
1. Executive Overview
2. What Actually Matters
3. What You Can Safely Ignore
4. Regional Perspective
5. 90-Day Direction
6. Closing Signal

CLOSING SIGNAL:
- EXACTLY one sentence.
- No formatting.

INTERNAL SIGNALS:
- Appear ONLY after:
  --- INTERNAL SIGNALS ---
- Max 3 short lines.
- NEVER visible.
`;

    /* ================================
       STRUCTURAL FACTS
    ================================= */

    systemPrompt += `
STRUCTURAL FACTS:
- Energy exposure present: ${hasEnergyExposure ? "YES" : "NO"}
- Fixed cost gravity present: ${fixedCore > 0 ? "YES" : "NO"}
- Recurring rigidity present: ${recurringServices > 0 ? "YES" : "NO"}
- Irregular pressure present: ${irregularPressure > 0 ? "YES" : "NO"}

CRITICAL LENS RULE:
- Select EXACTLY ONE dominant pressure.
- If Energy exposure = NO → ENERGY MUST NOT APPEAR.
`;

    if (region === "HU") {
      systemPrompt += `
REGION: Hungary
- Limited flexibility
- High sensitivity
`;
    }

    /* ================================
       USER CONTEXT
    ================================= */

    const baseUserPrompt = `
Region: ${region}
Cycle day: ${cycleDay}

Previously established internal signals:
${previousSignals || "None"}

TASK:
Write the monthly briefing strictly from structure.
Do not infer missing sectors.
`;

    /* ================================
       MODE PROMPTS
    ================================= */

    const executivePrompt = `
MODE: EXECUTIVE
- Calm
- Observational
- No action verbs
- No percentages

${baseUserPrompt}
`;

    const directivePrompt = `
MODE: DIRECTIVE
- Firm
- Decisive
- No hedging

${baseUserPrompt}
`;

    /* ================================
       GROQ CALL HELPER
    ================================= */

    const callGroq = async (prompt, temperature) => {
      const r = await fetch(
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
              { role: "user", content: prompt },
            ],
            temperature,
            max_tokens: 1000,
          }),
        }
      );

      if (!r.ok) throw new Error("Groq unavailable");

      const j = await r.json();
      let text = j?.choices?.[0]?.message?.content || "";

      const marker = "--- INTERNAL SIGNALS ---";
      if (text.includes(marker)) {
        text = text.split(marker)[0].trim();
      }

      return text;
    };

    /* ================================
       DUAL EXECUTION
    ================================= */

    const [executive, directive] = await Promise.all([
      callGroq(executivePrompt, 0.15),
      callGroq(directivePrompt, 0.1),
    ]);

    /* ================================
       RESPONSE (SNAPSHOT)
    ================================= */

    return res.status(200).json({
      snapshot: {
        date: new Date().toISOString().slice(0, 10),
        cycleDay,
        region,
        executive,
        directive,
      },
    });

  } catch (err) {
    console.error("Monthly AI crash:", err);
    return res.status(500).json({ briefing: "AI system error." });
  }
}
