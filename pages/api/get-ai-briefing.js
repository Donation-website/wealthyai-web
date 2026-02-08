export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ briefing: "Method not allowed." });
  }

  try {
    const {
      region,
      cycleDay,
      analysisMode, // backward compatibility
      previousSignals,
      weeklyFocus,
      isReturningCustomer,
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

    const fixedCore = S.housing + S.insurance + S.banking;
    const recurringServices = S.internet + S.mobile + S.tv;
    const irregularPressure = S.unexpected + S.other;

    // MATH CHECK FOR AI TRUTH
    const totalOut = fixedCore + recurringServices + irregularPressure + totalEnergy + S.water;
    const isDeficit = S.income < totalOut;
    const fragilityIndex = S.income > 0 ? ((totalOut / S.income) * 100).toFixed(1) : "INFINITE";

    /* ================================
        SYSTEM PROMPT — BASE (RE-STRENGTHENED)
    ================================= */

    let systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.

ROLE:
MONTHLY STRATEGIC FINANCIAL BRIEFING AUTHOR

PHILOSOPHY & CONSTITUTION:
- WealthyAI DOES NOT advise. It INTERPRETS.
- It provides a "clearer frame", not a better plan.
- The goal is "Clearer thinking", not "Faster decisions".

TONE & STYLE (CRITICAL):
- ALWAYS write in second person ("Your income", "You are facing").
- NEVER refer to "the user".
- AVOID robotic list-making. USE integrated, professional narrative flow. 
- BE observational and analytical.
- DO NOT use generic filler sentences.

ABSOLUTE RULE:
- ANY content after the marker "--- INTERNAL SIGNALS ---" is FOR INTERNAL USE ONLY.
- It MUST NOT appear in the visible briefing.

STRICT CONSTRAINTS:
- NEVER restate inputs (Do not say "Your rent is 1200").
- NEVER invent exposure.
- INCOME TRUTH: If income is 0, the structure is "unsupported". Do not hallucinate stability.

SCOPE:
- NEXT 90 DAYS

OUTPUT STRUCTURE:
1. Executive Overview
2. What Actually Matters
3. What You Can Safely Ignore
4. Regional Perspective
5. 90-Day Direction
6. Closing Signal (EXACTLY one sentence).

INTERNAL SIGNALS:
--- INTERNAL SIGNALS ---
`;

    systemPrompt += `
STRUCTURAL FACTS:
- Income: ${S.income} | Outflow: ${totalOut}
- State: ${isDeficit ? "DEFICIT" : "SURPLUS"} | Fragility: ${fragilityIndex}%
- Energy exposure: ${hasEnergyExposure ? "YES" : "NO"}
- Fixed cost gravity: ${fixedCore > 0 ? "YES" : "NO"}
- Recurring rigidity: ${recurringServices > 0 ? "YES" : "NO"}
- Irregular pressure: ${irregularPressure > 0 ? "YES" : "NO"}
`;

    if (weeklyFocus) {
      systemPrompt += `
WEEKLY INTERPRETATION LENS (DOMINANT):
- stability → describe predictability, fixed costs, and structural pressure.
- spending → analyze behavioral patterns, discretionary flow, and non-fixed categories.
- resilience → analyze buffers, risk tolerance, and structural fragility.
- direction → observe forward signals (no forecasting).

ACTIVE WEEKLY FOCUS:
- ${weeklyFocus}
`;
    }

    if (region === "HU") {
      systemPrompt += `\nREGION: Hungary (High utility sensitivity, currency volatility).`;
    } else {
      systemPrompt += `\nREGION: ${region || "International"}.`;
    }

    systemPrompt += `\nRETURNING CONTEXT: ${isReturningCustomer ? "YES" : "NO"}`;

    const baseUserPrompt = `
Region: ${region} | Cycle day: ${cycleDay} | Fragility: ${fragilityIndex}%
Previous signals: ${previousSignals || "None"}

TASK: Write the briefing strictly from structure through the lens of ${weeklyFocus || "general balance"}.
`;

    const executivePrompt = `MODE: EXECUTIVE\n- Calm, Observational.\n${baseUserPrompt}`;
    const directivePrompt = `MODE: DIRECTIVE\n- Firm, Strategic.\n${baseUserPrompt}`;

    /* ================================
        GROQ CALL (RESTORED TO INSTANT)
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
            model: "llama-3.1-8b-instant", // VISSZAÁLLÍTVA AZ EREDETI MODELLRE
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

      if (text.includes("--- INTERNAL SIGNALS ---")) {
        text = text.split("--- INTERNAL SIGNALS ---")[0].trim();
      }
      return text;
    };

    /* ================================
        EXECUTION
    ================================= */

    const executive = await callGroq(executivePrompt, 0.25);
    const directive = await callGroq(directivePrompt, 0.1);

    return res.status(200).json({
      briefing: executive,
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
