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

    /* ===== ADATOK ELŐKÉSZÍTÉSE ===== */
    const safe = (v) => (typeof v === "number" && isFinite(v) ? v : 0);
    const income = safe(weeklyIncome);
    const spend = safe(weeklySpend);
    const surplus = income - spend;
    const savingsRate = income > 0 ? surplus / income : 0;
    const days = Array.isArray(dailyTotals) ? dailyTotals.map(safe) : [];

    /* ===== ORSZÁG SPECIFIKUS ADATOK ===== */
    const COUNTRY = {
      US: { currency: "USD", avgWeekly: 900 },
      DE: { currency: "EUR", avgWeekly: 650 },
      UK: { currency: "GBP", avgWeekly: 720 },
      HU: { currency: "HUF", avgWeekly: 420 },
    };
    const ref = COUNTRY[country] || COUNTRY.US;

    /* ===== PROMPT ÖSSZEÁLLÍTÁSA ===== */
    const prompt = `
You are a professional financial analyst.
Context:
- Country: ${country} (${ref.currency})
- Weekly income: ${income}
- Weekly spending: ${spend}
- Weekly surplus: ${surplus}
- Savings rate: ${(savingsRate * 100).toFixed(1)}%
- Avg weekly spending in this country: ${ref.avgWeekly}

Daily spending values:
${days.map((v, i) => `Day ${i + 1}: ${v.toFixed(0)}`).join(", ")}

Task:
- Briefly analyze the highest and lowest spending days.
- Compare to country average.
- Give 2 concrete, realistic financial tips.
- Give a short monthly outlook.
Rules: Use bullet points, be specific, no generic fluff.
`;

    /* ===== HUGGING FACE ROUTER API HÍVÁS ===== */
    // Fontos: Az új URL a router.huggingface.co-t használja
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

    /* ===== HIBAKEZELÉS ÉS VÁLASZ ADÁSA ===== */
    if (result.error) {
      console.error("HF API Error:", result.error);
      return res.status(200).json({ 
        insight: `AI Error: ${result.error}. (Ellenőrizd a HF_TOKEN-t!)` 
      });
    }

    // A válasz feldolgozása (kezelve a különböző válaszformátumokat)
    let text = "";
    if (Array.isArray(result) && result[0]?.generated_text) {
      text = result[0].generated_text.trim();
    } else if (result.generated_text) {
      text = result.generated_text.trim();
    } else {
      text = "AI analysis temporarily unavailable. No text generated.";
    }

    return res.status(200).json({ insight: text });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({
      insight: "Internal server error. Please try again later.",
    });
  }
}
