export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { income, fixed, variable } = req.body;
  const token = process.env.HF_TOKEN;

  const inc = Number(income) || 0;
  const fix = Number(fixed) || 0;
  const vari = Number(variable) || 0;
  const totalCosts = fix + vari;

  try {
    // EZ AZ ÚJ GENERÁCIÓS URL (Router alapú)
    const response = await fetch(
      "https://api-inference.huggingface.co",
      {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] Professional Wealth Advisor. Income: $${inc}, Costs: $${totalCosts}. 3 tips. [/INST]`,
          parameters: { max_new_tokens: 150, wait_for_model: true }
        }),
      }
    );

    const result = await response.json();

    // Ha még töltődik a modell, adjunk értelmes választ
    if (result.error && result.estimated_time) {
      return res.status(200).json({ insight: "AI is warming up... try in 10s!" });
    }

    // A válasz kinyerése (Hugging Face specifikus tömb kezelés)
    let aiText = "";
    if (Array.isArray(result) && result[0]?.generated_text) {
      aiText = result[0].generated_text;
    } else if (result?.generated_text) {
      aiText = result.generated_text;
    }

    if (aiText) {
      const cleanText = aiText.split('[/INST]').pop().trim();
      return res.status(200).json({ insight: cleanText });
    }
    
    throw new Error("API response error");

  } catch (error) {
    console.error("LOG:", error.message);
    const surplus = inc - totalCosts;
    return res.status(200).json({ 
      insight: `• Budget: You have $${surplus} surplus.\n• Tip: Invest 20% in index funds.\n• Note: AI currently in fallback mode.` 
    });
  }
}
