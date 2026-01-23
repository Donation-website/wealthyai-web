export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { income, fixed, variable } = req.body;
  const token = process.env.HF_TOKEN;

  if (!token) {
    return res.status(500).json({
      insight: "HF_TOKEN missing in Vercel environment variables."
    });
  }

  const MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2";
  const API_URL = `https://router.huggingface.co/hf-inference/models/${MODEL_ID}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: `[INST] You are a financial advisor.
Income: $${income}
Expenses: $${Number(fixed) + Number(variable)}
Give 3 bullet points of advice. [/INST]`,
        parameters: {
          max_new_tokens: 150,
          wait_for_model: true
        }
      })
    });

    const result = await response.json();

    let aiText = "";
    if (Array.isArray(result) && result[0]?.generated_text) {
      aiText = result[0].generated_text;
    } else if (result?.generated_text) {
      aiText = result.generated_text;
    }

    if (!aiText) throw new Error("Empty AI response");

    const cleanText = aiText.split('[/INST]').pop().trim();
    return res.status(200).json({ insight: cleanText });

  } catch (error) {
    console.error("AI ERROR:", error.message);

    const surplus =
      Number(income || 0) -
      (Number(fixed || 0) + Number(variable || 0));

    return res.status(200).json({
      insight:
`• Surplus: $${surplus}
• Advice: Save at least 20%
• Status: AI connection failed (${error.message})`
    });
  }
}
