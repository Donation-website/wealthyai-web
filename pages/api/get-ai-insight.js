export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { income, fixed, variable } = req.body;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co",
      {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer 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" 
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] You are a professional WealthAI Advisor. 
          Monthly Income: $${income}, Fixed Costs: $${fixed}, Variable Costs: $${variable}.
          Give 3 specific, advanced financial strategies in English to maximize wealth. 
          Be aggressive and professional. Bullet points only. [/INST]`,
        }),
      }
    );

    const result = await response.json();
    // A Hugging Face néha listát ad vissza
    const resultData = Array.isArray(result) ? result[0] : result;
    const text = resultData?.generated_text || "";
    const cleanText = text.split('[/INST]').pop().trim();

    res.status(200).json({ insight: cleanText || "AI is calibrating, please try again." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI Engine error" });
  }
}
