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
    
    // Százalékos mutatók kiszámítása
    const usagePercentVal = sIncome > 0 ? (totalOut / sIncome) * 100 : (totalOut > 0 ? 100.1 : 0);
    const usagePercentStr = usagePercentVal.toFixed(1);
    const deficitAmount = balance < 0 ? Math.abs(balance) : 0;

    // Rendszer utasítás a Llama-nak - Beszédesebb, de szigorúbb logika
    const systemPrompt = `
You are WealthyAI — a professional financial data interpreter.
ROLE: Provide a professional "Quick Briefing" based on the provided data.

DATA:
- Monthly Income: ${sIncome}
- Total Expenses: ${totalOut}
- Net Balance: ${balance}
- Expense-to-Income Ratio: ${usagePercentStr}%

PHILOSOPHY:
- WealthyAI DOES NOT advise. It INTERPRETS.
- Tone: Analytical, objective, second person.
- Language: English.
- Do NOT use currency symbols or "units". Just numbers.

LOGIC CONSTRAINTS:
- If Ratio < 100%: State that expenses account for ${usagePercentStr}% of income, leaving a surplus of ${balance}.
- If Ratio > 100%: State that expenses exceed income by ${usagePercentStr}%, resulting in a deficit of ${deficitAmount}.
- NEVER use "exceeds" if the Ratio is below 100%.
- NEVER use metaphors like "double" unless the ratio is exactly 200%.

STRICT FORMATTING:
- Provide exactly 2 or 3 concise sentences of financial analysis.
- After the analysis, you MUST ALWAYS add this exact last sentence: "For a more complex exploration of your financial data and deeper insights, choose from our Premium plans below."
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
        temperature: 0.1, 
        max_tokens: 200, // Kicsit korlátozva, hogy beférjen a boxba
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
