export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ insight: "Method not allowed." });

  // Debug: megnézzük, lát-e bármit is (csak fejlesztés alatt)
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey.length < 5) {
    return res.status(200).json({ 
      insight: `Hiba: A GEMINI_API_KEY hiányzik. (Környezet: ${process.env.NODE_ENV})` 
    });
  }

  try {
    const { country = "US", weeklyIncome = 0, weeklySpend = 0, dailyTotals = [] } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com{apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Analyst mode: Country ${country}, Income ${weeklyIncome}, Spend ${weeklySpend}, Daily: ${dailyTotals.join(",")}. 2 tips please.` }] }]
        }),
      }
    );

    const result = await response.json();

    if (result.error) {
      return res.status(200).json({ insight: `Google hiba: ${result.error.message}` });
    }

    const aiText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "No response text.";
    return res.status(200).json({ insight: aiText.trim() });

  } catch (err) {
    return res.status(200).json({ insight: "Hálózati hiba a Google API hívásakor." });
  }
}
