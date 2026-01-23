export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { income, fixed, variable } = req.body;
  const token = process.env.HF_TOKEN;

  if (!token) {
    return res.status(500).json({ insight: "Hiba: HF_TOKEN hiányzik a Vercel-ből!" });
  }

  // AZ ÚJ ROUTER URL
  const MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2";
  const API_URL = `https://router.huggingface.co{MODEL_ID}`;

  try {
    const response = await fetch(API_URL, {
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      method: "POST",
      body: JSON.stringify({
        inputs: `[INST] Wealth Advisor. Income: $${income}, Costs: $${Number(fixed) + Number(variable)}. Give 3 bullet points of financial advice. [/INST]`,
        parameters: { 
          max_new_tokens: 150, 
          wait_for_model: true
        }
      }),
    });

    const result = await response.json();
    let aiText = "";
    if (Array.isArray(result) && result?.generated_text) {
      aiText = result.generated_text;
    } else if (result?.generated_text) {
      aiText = result.generated_text;
    }

    if (aiText) {
      const cleanText = aiText.split('[/INST]').pop().trim();
      return res.status(200).json({ insight: cleanText });
    }

    if (result.error) throw new Error(result.error);
    throw new Error("Empty response");

  } catch (error) {
    console.error("RÉSZLETES HIBA:", error.message);
    const surplus = Number(income || 0) - (Number(fixed || 0) + Number(variable || 0));
    res.status(200).json({ 
      insight: `• Surplus: $${surplus}\n• Advice: Save at least 20%.\n• Status: AI connection failed (${error.message}).` 
    });
  }
}
