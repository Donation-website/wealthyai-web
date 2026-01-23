export default async function handler(req, res) {
  // Csak POST kérést fogadunk el
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { income, fixed, variable } = req.body;
  const token = process.env.HF_TOKEN;

  // Ha nem találja a környezeti változót, itt egy hibaüzenet
  if (!token) {
    return res.status(500).json({ insight: "Hiba: A HF_TOKEN hiányzik a Vercel beállításokból!" });
  }

  // Megbízható ingyenes modell
  const MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2";

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co{MODEL_ID}`,
      {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] You are a professional Wealth Advisor. 
          Monthly Income: $${income}
          Fixed Costs: $${fixed}
          Variable Costs: $${variable}
          Give 3 very short, actionable financial tips for this person in English. [/INST]`,
          parameters: { 
            max_new_tokens: 150, 
            wait_for_model: true,
            return_full_text: false
          }
        }),
      }
    );

    const result = await response.json();

    // Debug log a Vercel konzolhoz
    console.log("HF Válasz:", result);

    if (result.error) {
      throw new Error(result.error);
    }

    let aiText = "";
    // A Hugging Face néha tömböt, néha objektumot ad vissza modelltől függően
    if (Array.isArray(result) && result[0]?.generated_text) {
      aiText = result[0].generated_text;
    } else if (result?.generated_text) {
      aiText = result.generated_text;
    }

    if (aiText) {
      return res.status(200).json({ insight: aiText.trim() });
    }
    
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("AI HIBA:", error.message);
    const surplus = Number(income || 0) - (Number(fixed || 0) + Number(variable || 0));
    
    // Tartalék válasz, ha az AI épp nem elérhető
    res.status(200).json({ 
      insight: `• Surplus: $${surplus}\n• Advice: Save 20% and track your variable costs.\n• Note: AI is currently warming up, try again in 10 seconds.` 
    });
  }
}
