export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { income, fixed, variable } = req.body;
  const token = process.env.HF_TOKEN;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co",
      {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] Wealth Advisor. Income: $${income}, Costs: $${Number(fixed) + Number(variable)}. Give 3 short tips. [/INST]`,
          parameters: { max_new_tokens: 150, wait_for_model: true }
        }),
      }
    );

    const result = await response.json();

    // LOGOLJUK A NYERS VÁLASZT, hogy lássuk a Vercelben, ha baj van
    console.log("HF NYERS VÁLASZ:", JSON.stringify(result));

    if (result.error) throw new Error(result.error);

    // Különböző válaszformátumok kezelése (Tömb vs Objektum)
    let aiText = "";
    if (Array.isArray(result) && result.length > 0) {
      aiText = result[0].generated_text;
    } else if (result.generated_text) {
      aiText = result.generated_text;
    }

    if (aiText) {
      // Csak az AI válaszát tartjuk meg, az utasítást levágjuk
      const cleanText = aiText.includes('[/INST]') 
        ? aiText.split('[/INST]').pop().trim() 
        : aiText.trim();
        
      return res.status(200).json({ insight: cleanText });
    }
    
    throw new Error("Empty generated_text");

  } catch (error) {
    console.error("AI HIBA RÉSZLETEI:", error.message);
    const surplus = Number(income) - (Number(fixed) + Number(variable));
    
    // Ha ide jutunk, legalább a matek legyen jó a tartalék szövegben
    res.status(200).json({ 
      insight: `• Budget: You have $${surplus} surplus.\n• Recommendation: Save at least 20%.\n• Status: AI is busy, showing calculated advice.` 
    });
  }
}
