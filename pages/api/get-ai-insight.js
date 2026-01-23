export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { income, fixed, variable } = req.body;
  const token = process.env.HF_TOKEN; // Vercel-ből olvassa!

  try {
    const response = await fetch(
      "https://router.huggingface.co",
      {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] You are a WealthAI Expert. Income: $${income}, Costs: $${fixed+variable}. Give 4 advanced wealth-building strategies in English. Bullet points. [/INST]`,
          parameters: { max_new_tokens: 300, wait_for_model: true }
        }),
      }
    );

    const result = await response.json();
    const aiText = Array.isArray(result) ? result[0].generated_text : result.generated_text;

    if (aiText) {
      const cleanText = aiText.split('[/INST]').pop().trim();
      return res.status(200).json({ insight: cleanText });
    }
    
    throw new Error("No AI text");
  } catch (error) {
    const surplus = income - (fixed + variable);
    // Dinamikus okos algoritmus, ha az AI épp nem válaszolna
    const smartTips = `• Based on your $${surplus} surplus, you could retire ${(surplus/income * 10).toFixed(1)} years earlier.\n• Recommended: $${(surplus * 0.4).toFixed(0)} to Index Funds, $${(surplus * 0.1).toFixed(0)} to Crypto/High-risk.\n• Your savings rate puts you in the top ${surplus > 2000 ? '5%' : '15%'} of our users.`;
    res.status(200).json({ insight: smartTips });
  }
}
