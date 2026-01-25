export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ insight: "Method not allowed." });
  }

  try {
    const { country = "US", weeklyIncome = 0, weeklySpend = 0, dailyTotals = [] } = req.body;

    // Egyszerűbb prompt a stabilitásért
    const prompt = `Analyze this weekly spending: Income ${weeklyIncome}, Spend ${weeklySpend}, Daily: ${dailyTotals.join(",")}. Country: ${country}. Give 2 tips.`;

    // 1. ÚJ ENDPOINT: Próbáljuk a közvetlen hívást a stabilabb Llama modellel
    const response = await fetch(
      "https://api-inference.huggingface.co",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 300, temperature: 0.7 }
        }),
      }
    );

    // Ha nem JSON jön vissza (pl. Not Found), itt kezeljük
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const rawText = await response.text();
      console.error("Nem JSON válasz érkezett:", rawText);
      return res.status(200).json({ insight: "AI endpoint error. Please check your HF_TOKEN or try again later." });
    }

    const result = await response.json();

    if (result.error) {
      return res.status(200).json({ insight: `AI error: ${result.error}` });
    }

    // A kinyerés módja: result[0].generated_text
    let aiText = "";
    if (Array.isArray(result) && result[0]?.generated_text) {
      aiText = result[0].generated_text;
    } else if (result.generated_text) {
      aiText = result.generated_text;
    } else {
      aiText = "Analysis ready, but response format was unexpected.";
    }

    // Levágjuk a promptot a válaszból, ha benne maradt volna
    const finalInsight = aiText.replace(prompt, "").trim();

    return res.status(200).json({ insight: finalInsight });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(200).json({ insight: `Connection error: ${err.message}` });
  }
}
