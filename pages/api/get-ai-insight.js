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
          inputs: `[INST] Professional WealthAI. Income: $${income}, Costs: $${fixed+variable}. Give 3 short financial tips in English. [/INST]`,
          parameters: { return_full_text: false, max_new_tokens: 200, wait_for_model: true }
        }),
      }
    );

    const result = await response.json();

    // Ha a Hugging Face hibát küld (pl. túlterheltség)
    if (result.error) {
      return res.status(200).json({ insight: "AI is busy: " + result.error });
    }

    // A válasz feldolgozása (Hugging Face formátumhoz igazítva)
    let aiText = "";
    if (Array.isArray(result) && result[0]?.generated_text) {
      aiText = result[0].generated_text;
    } else if (result.generated_text) {
      aiText = result.generated_text;
    } else {
      aiText = "No strategy generated. Please try again.";
    }

    res.status(200).json({ insight: aiText.trim() });
  } catch (error) {
    res.status(500).json({ error: "API Route Error: " + error.message });
  }
}
