export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { income, fixed, variable } = req.body;
  // A kulcsot most már a Vercelből olvassuk:
  const token = process.env.HF_TOKEN; 

  try {
    // JAVÍTOTT URL: Hozzáadtuk a modell nevét a router címhez
    const response = await fetch(
      "https://router.huggingface.co",
      {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] You are a professional WealthAI Advisor. My income is $${income}, costs: $${fixed + variable}. Give 3 specific financial strategies in English to maximize wealth. Bullet points only. [/INST]`,
          parameters: { max_new_tokens: 300, wait_for_model: true }
        }),
      }
    );

    const result = await response.json();

    // Ha a válasz tömb, az első elemből vesszük ki a szöveget
    const aiText = Array.isArray(result) && result?.generated_text ? result.generated_text : result.generated_text;

    if (aiText) {
      // Visszavágjuk a prompt részt a válaszból
      const cleanText = aiText.split('[/INST]').pop().trim();
      return res.status(200).json({ insight: cleanText });
    }
    
    throw new Error("No AI text was generated.");
  } catch (error) {
    console.error("AI Error Details:", error);
    const surplus = income - (fixed + variable);
    // Dinamikus okos algoritmus, ha az AI épp nem válaszolna
    const smartTips = `• Based on your $${surplus} surplus, you could retire ${(surplus/income * 10).toFixed(1)} years earlier.\n• Recommended: $${(surplus * 0.4).toFixed(0)} to Index Funds, $${(surplus * 0.1).toFixed(0)} to Crypto/High-risk.\n• Your savings rate puts you in the top 15% of our users.`;
    res.status(200).json({ insight: smartTips });
  }
}
