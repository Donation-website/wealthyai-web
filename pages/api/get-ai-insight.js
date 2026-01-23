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
    console.log("HF NYERS VÁLASZ:", JSON.stringify(result)); // Ezt keresd a logban!

    if (result.error) throw new Error(result.error);

    let aiText = "";
    // FONTOS JAVÍTÁS: A Hugging Face tömböt ad vissza, aminek az első eleme az objektum
    if (Array.isArray(result) && result[0]?.generated_text) {
      aiText = result[0].generated_text;
    } else if (result?.generated_text) {
      aiText = result.generated_text;
    }

    if (aiText) {
      const cleanText = aiText.includes('[/INST]') 
        ? aiText.split('[/INST]').pop().trim() 
        : aiText.trim();
        
      return res.status(200).json({ insight: cleanText });
    }
    
    throw new Error("Format error or empty response");

  } catch (error) {
    console.error("AI HIBA:", error.message);
    const surplus = Number(income) - (Number(fixed) + Number(variable));
    res.status(200).json({ 
      insight: `• Budget: You have $${surplus} surplus.\n• Recommendation: Save at least 20%.\n• Status: AI connection failed (${error.message}).` 
    });
  }
}
