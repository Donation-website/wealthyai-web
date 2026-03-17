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

    // Rendszer utasítás a Llama-nak
    const systemPrompt = `
You are WealthyAI — a professional financial data interpreter.
ROLE: Provide a 3-sentence, high-level "Quick Briefing" based on the provided data.

DATA:
- Monthly Income: ${sIncome} units
- Total Expenses: ${totalOut} units
- Net Balance: ${balance} units
- Expense-to-Income Ratio: ${usagePercent}%

PHILOSOPHY:
- WealthyAI DOES NOT advise. It INTERPRETS.
- Use the word "units" instead of currency symbols.
- Tone: Analytical, objective, second person ("Your income", "You are facing").
- Language: English.

STRICT CONSTRAINTS:
- EXACTLY 3 sentences.
- No greeting, no intro, just the analysis.
- The last sentence must acknowledge the structural status (Surplus or Deficit).
`;

    // Hívás a Groq API-hoz (Llama 3.1 8B - a leggyorsabb modell)
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
        temperature: 0.3,
        max_tokens: 200,
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
