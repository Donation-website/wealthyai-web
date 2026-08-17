export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { country, weekly } = req.body;

  if (!weekly || !country) {
    return res.status(400).json({ error: "Missing data" });
  }

  const safeNum = (v) => Math.max(0, Number(v || 0));

  const food = safeNum(weekly.food);
  const coffee = safeNum(weekly.coffee);
  const transport = safeNum(weekly.transport);
  const entertainment = safeNum(weekly.entertainment);
  const subscriptions = safeNum(weekly.subscriptions);
  const other = safeNum(weekly.other);

  const total = food + coffee + transport + entertainment + subscriptions + other;

  const prompt = `
You are a professional financial behavior analyst.

Context:
- User location: ${country}
- Timeframe: weekly spending behavior
- Goal: reduce unnecessary expenses and improve savings efficiency

Weekly spending breakdown (local currency / USD):
- Food & groceries: ${food}
- Coffee & snacks: ${coffee}
- Transport: ${transport}
- Entertainment: ${entertainment}
- Subscriptions: ${subscriptions}
- Other: ${other}
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
    const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 450,
      }),
    });

    if (!aiRes.ok) {
      const errData = await aiRes.json().catch(() => ({}));
      return res.status(500).json({ 
        insight: `AI backend unavailable: ${errData.error?.message || aiRes.status}` 
      });
    }

    const json = await aiRes.json();

    const text =
      json.choices?.[0]?.message?.content ||
      "AI analysis unavailable.";

    return res.status(200).json({ insight: text.trim() });
  } catch (err) {
    console.error("Weekly AI Error:", err);
    return res.status(500).json({
      insight: `• Spending patterns detected but AI analysis failed (${err.message}).\n• Consider reviewing impulse expenses.\n• Try reallocating discretionary spending next week.`,
    });
  }
}
