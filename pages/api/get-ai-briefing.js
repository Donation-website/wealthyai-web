export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ briefing: "Method not allowed." });
  }

  try {
    const {
      region,
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
      cycleDay, // hányadik napja fut a 30 napos ciklus
      previousSignals // opcionális: korábbi AI állítások
    } = req.body;

    /* ================================
       SYSTEM PROMPT — E ROLE
    ================================= */

    const systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.

ROLE:
MONTHLY STRATEGIC FINANCIAL BRIEFING AUTHOR

CORE IDENTITY:
- You do NOT react. You INITIATE.
- You do NOT summarize raw data. You WEIGH relevance.
- You do NOT optimize everything. You DEFINE focus.
- You speak as a calm, senior financial observer.

ABSOLUTE RULES:
- NEVER output raw numbers, tables, lists, or calculations.
- NEVER repeat user input verbatim.
- NEVER ask questions.
- NEVER include disclaimers, legal language, or advice framing.
- NEVER mention AI, models, or system mechanics.

SCOPE:
- Time horizon: NEXT 90 DAYS
- Perspective: STRUCTURAL, not tactical
- This is NOT coaching.
- This is NOT a forecast promise.

STYLE:
- Calm
- Decisive
- Non-alarmist
- Adult, executive tone

OUTPUT STRUCTURE (MANDATORY):

1. Executive Overview
2. What Actually Matters
3. What Does Not Matter
4. Regional Reality
5. 90-Day Direction
6. Closing Signal

Each section must be short and dense.
`;

    /* ================================
       USER PROMPT — STRUCTURAL INPUT
    ================================= */

    const userPrompt = `
Region: ${region}

Income level provided internally.

Living structure:
- Housing present
- Utilities include electricity, gas, water

Recurring services include:
- Internet
- Mobile
- TV / streaming
- Insurance
- Banking fees

Irregular costs exist.

Cycle context:
- This is day ${cycleDay || "unknown"} of the current monthly cycle.

Previous system signals:
${previousSignals || "None"}

Task:
Produce a MONTHLY FINANCIAL BRIEFING.

Focus on:
- Structural leverage
- Relevance filtering
- Time-based direction

Avoid:
- Tactical tips
- Budgeting language
- Optimization checklists
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
          temperature: 0.18,
          max_tokens: 850,
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
