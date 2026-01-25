export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ insight: "Method not allowed." });
  }

  try {
    const {
      country = "US",
      weeklyIncome = 0,
      weeklySpend = 0,
      dailyTotals = [],
    } = req.body;

    /* ===== SAFETY & FORMATTING ===== */
    const safe = (v) => (typeof v === "number" && isFinite(v) ? v : 0);
    const income = safe(weeklyIncome);
    const spend = safe(weeklySpend);
    const surplus = income - spend;
    const savingsRate = income > 0 ? surplus / income : 0;
    const days = Array.isArray(dailyTotals) ? dailyTotals.map(safe) : [];

    /* ===== COUNTRY BENCHMARKS ===== */
    const COUNTRY = {
      US: { currency: "USD", avgWeekly: 900 },
      DE: { currency: "EUR", avgWeekly: 650 },
      UK: { currency: "GBP", avgWeekly: 720 },
      HU: { currency: "HUF", avgWeekly: 420 },
    };
    const ref = COUNTRY[country] || COUNTRY.US;

    /* ===== PROMPT ===== */
    const prompt = `
You are a professional financial analyst.
Context:
- Country: ${country} (${ref.currency})
- Weekly income: ${income}
- Weekly spending: ${spend}
- Weekly surplus: ${surplus}
- Savings rate: ${(savingsRate * 100).toFixed(1)}%
- Avg weekly spending in this country: ${ref.avgWeekly}

Daily spending:
${days.map((v, i) => `Day ${i + 1}: ${v.toFixed(0)}`).join(", ")}

Task:
- Briefly analyze the highest and lowest spending days.
- Compare to country average.
- Give 2 concrete, realistic financial tips.
- Give a short monthly outlook.
Rules: Use bullet points, be specific, no generic fluff.
`;

    /* ===== HF API CALL WITH WAIT-FOR-MODEL ===== */
    console.log("Calling Hugging Face API...");

    const response = await fetch(
      "https://api-inference.huggingface.co",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true", // Fontos: megvárja, amíg a modell betölt
        },
        body: JSON.stringify({
          inputs: `<s>[INST] ${prompt} [/INST]`,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            return_full_text: false,
          },
        }),
      }
    );

    const result = await response.json();

    // Debug log a szerver oldalon (ezt a terminálban látod)
    console.log("HF Response status:", response.status);

    if (result.error) {
      console.error("HF API Error:", result.error);
      return res.status(200).json({ 
        insight: `AI is warming up: ${result.error}. Please try again in 10 seconds.` 
      });
    }

    // A Hugging Face válasza lehet tömb vagy objektum is
    let text = "";
    if (Array.isArray(result) && result[0]?.generated_text) {
      text = result[0].generated_text.trim();
    } else if (result.generated_text) {
      text = result.generated_text.trim();
    } else {
      text = "AI analysis temporarily unavailable. Please check your HF_TOKEN.";
    }

    return res.status(200).json({ insight: text });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({
      insight: "Internal server error. Please check your API configuration.",
    });
  }
}
