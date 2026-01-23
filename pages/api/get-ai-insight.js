export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { income, fixed, variable } = req.body;
  const token = process.env.HF_TOKEN;

  if (!token) {
    return res.status(500).json({
      insight: 'Error: HF_TOKEN is missing from Vercel environment variables.',
    });
  }

  const MODEL_ID = 'mistralai/Mistral-7B-Instruct-v0.2';
  const API_URL = `https://router.huggingface.co/hf-inference/models/${MODEL_ID}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json', // ⬅⬅⬅ EZ VOLT A KRITIKUS HIÁNYZÓ SOR
      },
      body: JSON.stringify({
        inputs: `[INST] You are a professional financial advisor.

Monthly income: $${income}
Total expenses: $${Number(fixed) + Number(variable)}

Give exactly 3 clear bullet points of financial advice. [/INST]`,
        parameters: {
          max_new_tokens: 150,
          wait_for_model: true,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HF API error ${response.status}: ${text}`);
    }

    const result = await response.json();

    let aiText = '';

    // HuggingFace Router többféle választ adhat
    if (Array.isArray(result) && result[0]?.generated_text) {
      aiText = result[0].generated_text;
    } else if (result?.generated_text) {
      aiText = result.generated_text;
    }

    if (!aiText) {
      throw new Error('Empty AI response');
    }

    const cleanText = aiText.split('[/INST]').pop().trim();

    return res.status(200).json({ insight: cleanText });
  } catch (error) {
    console.error('AI ERROR:', error.message);

    const surplus =
      Number(income || 0) -
      (Number(fixed || 0) + Number(variable || 0));

    return res.status(200).json({
      insight: `• Surplus: $${surplus}
• Advice: Save at least 20% of your income.
• Status: AI connection failed (${error.message})`,
    });
  }
}
