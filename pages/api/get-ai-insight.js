export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { income, fixed, variable } = req.body;
  const token = process.env.HF_TOKEN;

  if (!token) {
    return res.status(500).json({
      insight: 'HF_TOKEN missing from Vercel environment variables.',
    });
  }

  const API_URL = 'https://router.huggingface.co/v1/chat/completions';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.1-8B-Instruct',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional financial advisor. Respond with exactly 3 bullet points.',
          },
          {
            role: 'user',
            content: `My monthly income is $${income}. My total expenses are $${
              Number(fixed) + Number(variable)
            }. Give concise financial advice.`,
          },
        ],
        max_tokens: 180,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HF API ${response.status}: ${text}`);
    }

    const result = await response.json();
    const aiText = result?.choices?.[0]?.message?.content;

    if (!aiText) {
      throw new Error('Empty AI response');
    }

    return res.status(200).json({ insight: aiText.trim() });
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
