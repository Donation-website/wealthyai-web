export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { income, fixed, variable } = req.body;
  
  // A Te Hugging Face tokened beillesztve
  const token = "hf_WnmlLqCqIjjWiiQIdhxEWXsFJjXXNFIjXXNFIvxR"; 

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
          inputs: `[INST] You are a professional WealthAI Advisor. 
          Monthly Income: $${income}, Fixed Costs: $${fixed}, Variable Costs: $${variable}.
          Give 3 specific financial strategies in English to maximize wealth. 
          Bullet points only. [/INST]`,
          parameters: { 
            return_full_text: false, 
            max_new_tokens: 250,
            wait_for_model: true // Megvárja, amíg a modell betöltődik
          }
        }),
      }
    );

    const result = await response.json();

    // Hibakezelés, ha a modell éppen ébredezik
    if (result.error && result.estimated_time) {
      return res.status(200).json({ 
        insight: `AI engine is warming up (Ready in ${Math.round(result.estimated_time)}s). Please wait a moment and click again.` 
      });
    }

    // A Hugging Face válaszának feldolgozása (tömb vagy objektum formátum)
    let aiText = "";
    if (Array.isArray(result) && result[0]?.generated_text) {
      aiText = result[0].generated_text;
    } else if (result?.generated_text) {
      aiText = result.generated_text;
    }

    if (!aiText) {
      return res.status(200).json({ insight: "The AI is processing heavy data. Please try one more time in 5 seconds." });
    }

    res.status(200).json({ insight: aiText.trim() });

  } catch (error) {
    console.error("AI hiba:", error);
    res.status(500).json({ error: "AI Engine connection failed." });
  }
}
