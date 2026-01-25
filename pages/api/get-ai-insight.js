export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ insight: "Method not allowed." });
  }

  try {
    const { country = "US", weeklyIncome = 0, weeklySpend = 0, dailyTotals = [] } = req.body;

    const safe = (v) => (typeof v === "number" && isFinite(v) ? v : 0);
    const income = safe(weeklyIncome);
    const spend = safe(weeklySpend);
    const days = Array.isArray(dailyTotals) ? dailyTotals.map(safe) : [];

    const prompt = `<s>[INST] Analyze this weekly spending:
    - Country: ${country}
    - Income: ${income}
    - Spending: ${spend}
    - Daily Breakdown: ${days.join(", ")}
    Identify the highest/lowest days and give 2 saving tips. [/INST]`;

    // AZ ÚJ ROUTER URL
    const response = await fetch(
      "https://router.huggingface.co",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 400, temperature: 0.7 }
        }),
      }
    );

    const result = await response.json();

    if (result.error) {
      return res.status(200).json({ insight: `AI error: ${result.error}` });
    }

    // FONTOS: A Router API szinte mindig tömbbel tér vissza: [{ generated_text: "..." }]
    let aiText = "";
    if (Array.isArray(result) && result[0]?.generated_text) {
      aiText = result[0].generated_text;
    } else if (result.generated_text) {
      aiText = result.generated_text;
    } else {
      aiText = "Analysis complete, but the response format was unusual.";
    }

    // A prompt levágása a válaszból (tisztítás)
    const cleanText = aiText.split("[/INST]").pop().trim();

    return res.status(200).json({ insight: cleanText });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(200).json({ insight: "Connection error. Please try again." });
  }
}
