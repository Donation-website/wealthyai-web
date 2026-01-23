export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { income, fixed, variable } = req.body;
  const token = "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"; 

  try {
    // STABILABB URL: Visszatértünk az inference-api-hoz, de a pontos modell útvonallal
    const response = await fetch(
      "https://api-inference.huggingface.co",
      {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] You are a professional WealthAI Advisor. Income: $${income}, Fixed: $${fixed}, Variable: $${variable}. Give 3 specific, short financial strategies in English to maximize wealth. Bullet points only. [/INST]`,
          parameters: { 
            return_full_text: false, 
            max_new_tokens: 250, 
            wait_for_model: true 
          }
        }),
      }
    );

    // Itt a javítás: Először szövegként olvassuk be, hogy lássuk, ha 404 vagy hiba van
    const rawResponse = await response.text();
    
    let result;
    try {
      result = JSON.parse(rawResponse);
    } catch (e) {
      console.error("Nem JSON válasz érkezett:", rawResponse);
      return res.status(200).json({ insight: "AI service is updating. Please try again in 30 seconds." });
    }

    if (result.error) {
      if (result.estimated_time) {
        return res.status(200).json({ insight: `AI is warming up (Ready in ${Math.round(result.estimated_time)}s). Please wait and click again.` });
      }
      return res.status(200).json({ insight: "AI Error: " + result.error });
    }

    // A Hugging Face válasza egy tömb: [{generated_text: "..."}]
    let aiText = "";
    if (Array.isArray(result) && result[0] && result[0].generated_text) {
      aiText = result[0].generated_text;
    } else if (result.generated_text) {
      aiText = result.generated_text;
    } else {
      aiText = "The AI is processing your request. Please click again.";
    }

    res.status(200).json({ insight: aiText.trim() });
  } catch (error) {
    console.error("Szerver hiba:", error);
    res.status(500).json({ error: "Network Error: Please try again." });
  }
}
