export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ insight: "Method not allowed." });
  }

  try {
    const {
      mode,
      country,
      weeklyIncome,
      weeklySpend,
      dailyTotals,
      breakdown,
      income,
      fixed,
      variable,
    } = req.body;

    /* ================================
        DATA QUALITY CHECK
     ================================= */

    const nonZeroDays = Array.isArray(dailyTotals)
      ? dailyTotals.filter(v => v > 0).length
      : 0;

    const dataQuality =
      nonZeroDays >= 3 ? "good" :
      nonZeroDays >= 1 ? "partial" :
      "low";

    /* ================================
        PROMPTS
     ================================= */

    let systemPrompt = "";
    let userPrompt = "";
    let upgradeHint = "";

    /* Common Personality Rules to ensure personal tone */
    const personalityRules = `
PERSONALITY & LANGUAGE RULES:
- NEVER use the word "user" or "felhasználó".
- ALWAYS address the person directly as "Te" (You).
- Use a personal, supportive tone (e.g., "A Te pénzügyeid", "Neked segít", "A Te helyzeted").
- Language: Hungarian (unless the request is clearly in English).
- Be empathetic but grounded.
`;

    /* ===== DAY MODE ===== */

    if (mode === "day") {
      systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.
MODE: DAILY FINANCIAL PULSE

${personalityRules}

ABSOLUTE RULES (CRITICAL):
- NEVER output raw numbers lists, arrays, JSON, or data dumps.
- NEVER repeat input verbatim.
- ALL data must be summarized in natural language.

STRUCTURE (MAX 3 SECTIONS):
1. A Te mai pénzügyi állapotod
2. Mit jelent ez Számodra?
3. Irányvonal a következő 7 napra

STYLE: Calm, Professional, Personal.
`;

      userPrompt = `
Income: ${income}
Fixed costs: ${fixed}
Variable spending: ${variable}

Task: Adj egy SZEMÉLYES napi pénzügyi gyorsjelentést a fenti adatok alapján. 
Beszélj közvetlenül HOZZÁM. Kerüld a technikai listákat.
`;

      upgradeHint = `
Ez a napi pillanatkép rövid távú jelzésként működik a legjobban számodra. 
A heti és havi nézetek segítenek megerősíteni a mintákat, és mélyebb előrejelzést adnak Neked.
`;
    }

    /* ===== WEEK MODE ===== */

    if (mode === "week") {
      systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.
MODE: WEEKLY BEHAVIOR INTERPRETER

${personalityRules}

ABSOLUTE RULES:
- NEVER output arrays, JSON, or tables.
- Summarize behavior patterns only.
- Address the person directly ("Te", "Tiéd").

GOAL: Explain WEEKLY behavior and guide the next step.

STRUCTURE:
1. Heti összefoglaló (személyes hangvételben)
2. Mit jelent ez a Te számodra?
3. Viselkedési mintázatod
4. Javasolt akcióterv a következő hetedre
5. 1 hónapos kilátások (ha az adatok engedik)

UPGRADE RULE: Mention advanced analysis as a system capability only. No sales tone.
`;

      userPrompt = `
Country: ${country}
Weekly income: ${weeklyIncome}
Weekly spending: ${weeklySpend}
Data quality: ${dataQuality}

Task: Készíts egy SZEMÉLYES heti intelligencia jelentést. 
Ne mutass nyers adatokat. A Te hangvéted legyen közvetlen és támogató.
`;

      upgradeHint = `
A mélyebb, országspecifikus elemzésekhez és a hosszú távú minták felismeréséhez a Havi Intelligencia szint kiterjeszti a látókörödet a heti kereteken túl.
`;
    }

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
          temperature: 0.3, // Slightly increased for more natural flow
          max_tokens: mode === "day" ? 350 : 700,
        }),
      }
    );

    if (!groqRes.ok) {
      return res.status(500).json({ insight: "AI backend unavailable." });
    }

    const json = await groqRes.json();
    let text =
      json?.choices?.[0]?.message?.content ||
      "Sajnos most nem tudtam elemezni az adatokat.";

    if (dataQuality === "good" && upgradeHint) {
      text += "\n\n" + upgradeHint.trim();
    }

    return res.status(200).json({ insight: text.trim() });

  } catch (err) {
    console.error("AI crash:", err);
    return res.status(500).json({ insight: "AI rendszerhiba történt." });
  }
}
