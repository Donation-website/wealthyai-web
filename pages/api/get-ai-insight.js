export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { income, fixed, variable } = req.body;

  try {
    // Ingyenes modell hívása. Megjegyzés: Ha nincs saját kulcsod, 
    // a Hugging Face korlátozhatja a hívások számát.
    const response = await fetch(
      "https://api-inference.huggingface.co",
      {
        headers: { 
          "Content-Type": "application/json"
          // Ha van saját Hugging Face tokened, ide írhatod: "Authorization": "Bearer hf_..."
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] You are a professional WealthAI Advisor. 
          Monthly Income: $${income}, Fixed Costs: $${fixed}, Variable Costs: $${variable}.
          Give 3 specific financial strategies in English to maximize wealth. 
          Bullet points only. [/INST]`,
        }),
      }
    );

    const result = await response.json();
    
    // Kezeljük, ha a válasz egy tömb (Hugging Face specifikus)
    let text = "";
    if (Array.isArray(result) && result[0]?.generated_text) {
      text = result[0].generated_text;
    } else if (result?.generated_text) {
      text = result.generated_text;
    }

    // Csak az AI válaszát vágjuk ki
    const cleanText = text.includes('[/INST]') 
      ? text.split('[/INST]').pop().trim() 
      : text || "AI is warmimg up, please try again in 5 seconds.";

    res.status(200).json({ insight: cleanText });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI Engine is busy" });
  }
}
