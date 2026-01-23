export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { income, fixed, variable } = req.body;
  const token = "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"; 

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
          inputs: `[INST] You are a professional WealthAI Advisor. Income: $${income}, Fixed: $${fixed}, Variable: $${variable}. Give 3 short financial strategies in English. Bullet points only. [/INST]`,
          parameters: { 
            return_full_text: false, 
            max_new_tokens: 250,
            wait_for_model: true 
          }
        }),
      }
    );

    const result = await response.json();

    // HIBAKERESÉS: Ha a modell ébredezik
    if (result.error && result.estimated_time) {
      return res.status(200).json({ 
        insight: `AI is warming up (Ready in ${Math.round(result.estimated_time)}s). Please wait and click again.` 
      });
    }

    // JAVÍTOTT KIOLVASÁS: A Hugging Face legtöbbször egy listát küld vissza: [{generated_text: "..."}]
    let aiText = "";
    if (Array.isArray(result) && result[0] && result[0].generated_text) {
      aiText = result[0].generated_text;
    } else if (result.generated_text) {
      aiText = result.generated_text;
    } else {
      // Ha még mindig baj van, írjuk ki mi jött vissza, hogy lássuk a hibát
      console.log("Hugging Face válasz:", JSON.stringify(result));
      aiText = "The AI model is still loading. Please try again in 10 seconds.";
    }

    res.status(200).json({ insight: aiText.trim() });

  } catch (error) {
    res.status(500).json({ error: "AI Engine connection failed." });
  }
}
