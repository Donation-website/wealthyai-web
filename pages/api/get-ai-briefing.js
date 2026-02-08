export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ briefing: "Method not allowed." });
  }

  try {
    const {
      mode, // 🆕 ÚJ: Ezzel döntjük el, mit csinálunk
      importText, // 🆕 ÚJ: A beillesztett nyers szöveg
      region,
      cycleDay,
      analysisMode,
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

    /* ==========================================
       🆕 SMART SYNC ÁG (CSAK HA AZ ÚJ FUNKCIÓT HÍVJÁK)
       Ez az ág teljesen elkülönül a briefing generálástól.
    ============================================= */
    if (mode === "parse_statement" && importText) {
      const parseSystemPrompt = `
        You are a financial data extractor.
        TASK: Extract numbers from the provided bank statement text into a JSON object.
        
        RULES:
        - Return ONLY a valid JSON object.
        - Use these keys: income, housing, electricity, gas, water, internet, mobile, tv, insurance, banking, unexpected, other.
        - If a value is missing or the text is non-financial (emojis, gibberish), use 0.
        - Combine multiple entries for the same category.
        - NO explanation, NO text, ONLY JSON.
      `;

      const rParse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: parseSystemPrompt },
            { role: "user", content: `Extract data from this text: ${importText}` },
          ],
          temperature: 0, // 0 = Maximális pontosság, nincs kreativitás
          response_format: { type: "json_object" } // Kényszerített JSON válasz
        }),
      });

      if (!rParse.ok) throw new Error("Groq parse unavailable");
      const jParse = await rParse.json();
      const extractedData = JSON.parse(jParse?.choices?.[0]?.message?.content || "{}");

      // Válasz visszaküldése és a folyamat megállítása itt (a briefing nem fut le)
      return res.status(200).json({ extractedData });
    }

    /* ==========================================
       EREDETI LOGIKA (BRIEFING GENERÁLÁS)
       Innen semmi nem változott, minden marad a régiben.
    ============================================= */

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

    const totalEnergy = S.electricity + S.gas;
    const hasEnergyExposure = totalEnergy > 0;
    const fixedCore = S.housing + S.insurance + S.banking;
    const recurringServices = S.internet + S.mobile + S.tv;
    const irregularPressure = S.unexpected + S.other;

    let systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.

ROLE:
MONTHLY STRATEGIC FINANCIAL BRIEFING AUTHOR

ABSOLUTE RULE:
- ALWAYS write in second person.
- NEVER refer to "the user".

CRITICAL VISIBILITY RULE:
- ANY content after the marker "--- INTERNAL SIGNALS ---" is FOR INTERNAL USE ONLY.
- It MUST NOT appear in the visible briefing.

WHAT THIS IS:
- Structural financial briefing.

WHAT THIS IS NOT:
- Advice.
- Instructions.
- Optimization.

STRUCTURE DEFINITIONS:
- Energy exposure = electricity + gas ONLY.
- Water is NOT energy.

STRICT CONSTRAINTS:
- NEVER restate inputs.
- NEVER invent exposure.
- NEVER infer missing sectors.

SCOPE:
- NEXT 90 DAYS

OUTPUT STRUCTURE:
1. Executive Overview
2. What Actually Matters
3. What You Can Safely Ignore
4. Regional Perspective
5. 90-Day Direction
6. Closing Signal

CLOSING SIGNAL:
- EXACTLY one sentence.

INTERNAL SIGNALS:
--- INTERNAL SIGNALS ---
`;

    systemPrompt += `
STRUCTURAL FACTS:
- Energy exposure present: ${hasEnergyExposure ? "YES" : "NO"}
- Fixed cost gravity present: ${fixedCore > 0 ? "YES" : "NO"}
- Recurring rigidity present: ${recurringServices > 0 ? "YES" : "NO"}
- Irregular pressure present: ${irregularPressure > 0 ? "YES" : "NO"}

CRITICAL LENS RULE:
- Select EXACTLY ONE dominant pressure.
`;

    if (weeklyFocus) {
      systemPrompt += `
WEEKLY INTERPRETATION LENS:
- stability → emphasize predictability, fixed costs, and structural pressure
- spending → emphasize behavioral patterns and discretionary control
- resilience → emphasize buffers, risk tolerance, and fragility
- direction → emphasize forward signals within the next 90 days

ACTIVE WEEKLY FOCUS:
- ${weeklyFocus}
`;
    } else {
      systemPrompt += `
WEEKLY INTERPRETATION:
- Neutral structural interpretation
`;
    }

    if (region === "HU") {
      systemPrompt += `
REGION: Hungary
- Limited flexibility
- High sensitivity
`;
    }

    systemPrompt += `
RETURNING CONTEXT:
- Returning monthly subscriber: ${isReturningCustomer ? "YES" : "NO"}

NARRATIVE CONTINUITY RULE:
- If returning subscriber = YES:
  - Do NOT frame insights as first-time exposure
  - Maintain structural continuity across cycles
  - Preserve tone maturity without altering structure
`;

    const baseUserPrompt = `
Region: ${region}
Cycle day: ${cycleDay}

Previous signals:
${previousSignals || "None"}

TASK:
Write the monthly briefing strictly from structure.
`;

    const executivePrompt = `
MODE: EXECUTIVE
- Calm
- Observational
- No urgency

${baseUserPrompt}
`;

    const directivePrompt = `
MODE: DIRECTIVE
- Firm
- Decisive

${baseUserPrompt}
`;

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

      if (text.includes("--- INTERNAL SIGNALS ---")) {
        text = text.split("--- INTERNAL SIGNALS ---")[0].trim();
      }

      return text;
    };

    const executive = await callGroq(executivePrompt, 0.15);
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
