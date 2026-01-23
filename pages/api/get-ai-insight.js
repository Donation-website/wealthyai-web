export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { income, fixed, variable } = req.body;
  const token = "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"; 

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
          inputs: `[INST] You are a professional WealthAI Advisor. My monthly income is $${income}, fixed costs are $${fixed}, and variable costs are $${variable}. Give 3 specific, short financial strategies in English to maximize my wealth. Bullet points only. [/INST]`,
          parameters: { 
            return_full_text: false, 
            max_new_tokens: 250, 
            wait_for_model: true 
          }
        }),
      }
    );

    const result = await response.json();

    // Hugging Face válaszkezelés: az eredmény szinte mindig egy tömb első eleme
    let aiText = "";
    if (Array.isArray(result) && result[0] && result[0].generated_text) {
      aiText = result[0].generated_text;
    } else if (result.generated_text) {
      aiText = result.generated_text;
    } else if (result.error) {
      aiText = "AI is warming up: " + result.error;
    } else {
      aiText = "The AI is processing. Please try again in 10 seconds.";
    }

    res.status(200).json({ insight: aiText.trim() });
  } catch (error) {
    console.error("Szerver hiba:", error);
    res.status(500).json({ error: "Network Error: " + error.message });
  }
}
