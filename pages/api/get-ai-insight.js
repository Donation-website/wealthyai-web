export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { income, fixed, variable } = req.body;
  const token = process.env.HF_TOKEN;

  const inc = Number(income) || 0;
  const fix = Number(fixed) || 0;
  const vari = Number(variable) || 0;
  const totalCosts = fix + vari;

  try {
    // ÚJ URL: A router.huggingface.co használata a Mistral modellel
    const response = await fetch(
      "https://router.huggingface.co",
      {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] Professional Wealth Advisor. Income: $${inc}, Total Costs: $${totalCosts}. Give 3 short, professional pro tips. [/INST]`,
          parameters: { 
            max_new_tokens: 200, 
            wait_for_model: true,
            return_full_text: false 
          }
        }),
      }
    );

    const result = await response.json();

    // Ha még töltődik a modell
    if (result.error && result.estimated_time) {
      return res.status(200).json({ insight: "AI is warming up... Please try again in 10 seconds!" });
    }

    // A válasz kinyerése
    let aiText = "";
    if (Array.isArray(result)) {
      aiText = result[0]?.generated_text || "";
    } else {
      aiText = result?.generated_text || "";
    }

    if (aiText) {
      const cleanText = aiText.replace(/\[\/INST\]/g, "").trim();
      return res.status(200).json({ insight: cleanText });
    }
    
    throw new Error("Invalid AI response format");

  } catch (error) {
    console.error("DEBUG ERROR:", error.message);
    
    const surplus = inc - totalCosts;
    const fallback = `• Strategy: Based on your $${surplus} surplus, consider the 50/30/20 rule.\n• Optimization: Your variable costs ($${vari}) could be reduced to save more.\n• Action: Build a 6-month emergency fund first.`;
    
    res.status(200).json({ insight: fallback });
  }
}
