export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { income, fixed, variable } = req.body;
  const token = "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"; 

  try {
    // A PONTOS ÚJ URL FORMÁTUM (router + modell név közvetlenül)
    const response = await fetch(
      "https://router.huggingface.co",
      {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] You are a professional WealthAI Advisor. My income is $${income}, expenses: $${fixed + variable}. Give 3 short financial tips in English. Bullet points only. [/INST]`,
          parameters: { 
            return_full_text: false, 
            max_new_tokens: 250, 
            wait_for_model: true 
          }
        }),
      }
    );

    const rawResponse = await response.text();
    let result;
    
    try {
      result = JSON.parse(rawResponse);
    } catch (e) {
      return res.status(200).json({ insight: "AI is synchronizing. Please try again." });
    }

    // A Router válasza általában egy lista, pl: [{ "generated_text": "..." }]
    let aiText = "";
    
    if (Array.isArray(result) && result[0] && result[0].generated_text) {
      aiText = result[0].generated_text;
    } else if (result && result.generated_text) {
      aiText = result.generated_text;
    } else if (result && result.error) {
      // Ha még mindig warming up-ol
      if (result.estimated_time) {
        return res.status(200).json({ insight: `Model is loading. Ready in ${Math.round(result.estimated_time)}s. Please click again.` });
      }
      aiText = "AI Notice: " + result.error;
    } else {
      aiText = "Analysis complete, but formatting. Please try once more.";
    }

    res.status(200).json({ insight: aiText.trim() });

  } catch (error) {
    res.status(500).json({ error: "External API Error. Please try again." });
  }
}
