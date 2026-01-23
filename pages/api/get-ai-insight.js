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
          parameters: { return_full_text: false, max_new_tokens: 250, wait_for_model: true }
        }),
      }
    );

    const result = await response.json();

    // A Hugging Face válasza szinte mindig egy lista: [{generated_text: "..."}]
    let aiText = "";
    if (Array.isArray(result) && result[0] && result[0].generated_text) {
      aiText = result[0].generated_text;
    } else if (result && result.generated_text) {
      aiText = result.generated_text;
    } else if (result.error) {
      aiText = "AI Error: " + result.error;
    } else {
      aiText = "The AI is thinking. Please try again in 5 seconds.";
    }

    res.status(200).json({ insight: aiText.trim() });
  } catch (error) {
    res.status(500).json({ error: "Connection failed." });
  }
}
