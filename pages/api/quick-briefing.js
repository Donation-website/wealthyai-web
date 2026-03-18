export default async function handler(req, res) {
  // Csak POST kéréseket fogadunk el
  if (req.method !== "POST") {
    return res.status(405).json({ briefing: "Method not allowed." });
  }

  try {
    const { income, fixed, variable } = req.body;

    // Alapvető számítások az AI-nak (Sanitization)
    const sIncome = Math.max(0, Number(income || 0));
    const sFixed = Math.max(0, Number(fixed || 0));
    const sVariable = Math.max(0, Number(variable || 0));
    
    const totalOut = sFixed + sVariable;
    const balance = sIncome - totalOut;
    const usagePercent = sIncome > 0 ? ((totalOut / sIncome) * 100).toFixed(1) : 100;

    // Rendszer utasítás a Llama-nak - Javított pontossági korlátokkal
    const systemPrompt = `
You are WealthyAI — a professional financial data interpreter.
ROLE: Provide a professional "Quick Briefing" based on the provided data.

DATA:
- Monthly Income: ${sIncome}
- Total Expenses: ${totalOut}
- Net Balance: ${balance}
- Expense-to-Income Ratio: ${usagePercent}%

PHILOSOPHY:
- WealthyAI DOES NOT advise. It INTERPRETS.
- Tone: Analytical, objective, second person ("Your income", "You are facing").
- Language: English.
- Do NOT use currency symbols or the word "units". Just use the numbers.

STRICT CONSTRAINTS:
- Provide exactly 2 sentences of financial analysis.
- ACCURACY: Be mathematically precise. Do NOT use metaphors like "double" unless the ratio is at least 200%. If expenses exceed income, state it as a deficit or a percentage over 100%.
- After the analysis, you MUST ALWAYS add this exact third sentence: "For a more complex exploration of your financial data and deeper insights, choose from our Premium plans below."
- No greeting, no intro, no other text.
`;

    // Hívás a Groq API-hoz
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Interpret my current financial numbers." },
        ],
        temperature: 0.1, // Alacsonyabb hőmérséklet a nagyobb precizitásért
        max_tokens: 250,
      }),
    });

    if (!response.ok) {
      throw new Error("Groq API connection failed");
    }

    const data = await response.json();
    const briefingText = data.choices[0]?.message?.content || "Analysis temporarily unavailable.";

    // Válasz küldése a frontendnek
    return res.status(200).json({ briefing: briefingText });

  } catch (err) {
    console.error("Quick Briefing AI Error:", err);
    return res.status(500).json({ briefing: "The AI system is currently re-calibrating. Please try again in a moment." });
  }
}
