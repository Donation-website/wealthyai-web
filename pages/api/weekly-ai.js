export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { country, weekly } = req.body;

  if (!weekly || !country) {
    return res.status(400).json({ error: "Missing data" });
  }

  const total =
    weekly.food +
    weekly.coffee +
    weekly.transport +
    weekly.entertainment +
    weekly.subscriptions +
    weekly.other;

  const prompt = `
You are a professional financial behavior analyst.

Context:
- User location: ${country}
- Timeframe: weekly spending behavior
- Goal: reduce unnecessary expenses and improve savings efficiency

Weekly spending breakdown (USD or local equivalent):
- Food & groceries: ${weekly.food}
- Coffee & snacks: ${weekly.coffee}
- Transport: ${weekly.transport}
- Entertainment: ${weekly.entertainment}
- Subscriptions: ${weekly.subscriptions}
- Other: ${weekly.other}
- TOTAL weekly spend: ${total}

Instructions:
1. Identify 2–3 concrete behavioral patterns (e.g. impulse spending, recurring habits).
2. Mention at least one country-specific insight relevant to ${country}.
3. Provide clear, actionable suggestions that can be applied next week.
4. Do NOT give generic advice. Be specific.
5. Output in bullet points.

Tone: professional, analytical, concise.
`;

  try {
    const aiRes = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3-8B-Instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 350,
      }),
    });

    const json = await aiRes.json();

    const text =
      json.choices?.[0]?.message?.content ||
      "AI analysis unavailable.";

    res.status(200).json({ insight: text });
  } catch (err) {
    res.status(200).json({
      insight:
        "• Spending patterns detected but AI analysis failed.\n• Consider reviewing impulse expenses.\n• Try reallocating discretionary spending next week.",
    });
  }
}
