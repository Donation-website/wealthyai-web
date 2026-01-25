export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ insight: "Method not allowed." });

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(200).json({ insight: "Hiba: A GEMINI_API_KEY nem található a környezeti változók között!" });
  }

  try {
    const { country = "US", weeklyIncome = 0, weeklySpend = 0, dailyTotals = [] } = req.body;

    const promptText = `You are a professional financial analyst. Analyze these numbers:
    - Country: ${country}
    - Weekly Income: ${weeklyIncome}
    - Weekly Spend: ${weeklySpend}
    - Daily Spendings: ${dailyTotals.join(", ")}
    
    Task: Identify the highest/lowest spending days, compare to country average, and give 2 concrete saving tips. Use bullet points and be very concise.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com{apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        }),
      }
    );

    const result = await response.json();

    if (result.error) {
      console.error("Gemini Error:", result.error);
      return res.status(200).json({ insight: `Gemini API Hiba: ${result.error.message}` });
    }

    const aiText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      return res.status(200).json({ insight: "Az AI válaszolt, de nem található szöveg a válaszban." });
    }

    return res.status(200).json({ insight: aiText.trim() });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(200).json({ insight: "Hálózati hiba történt a Google AI elérésekor." });
  }
}
