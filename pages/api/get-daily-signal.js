export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ signal: null });
  }

  try {
    const { region, cycleDay } = req.body;

    const systemPrompt = `
You are WealthyAI.

ROLE:
DAILY FINANCIAL SIGNAL GENERATOR

RULES:
- Output EXACTLY one sentence.
- No advice.
- No instructions.
- No numbers.
- No lists.
- No headings.
- Tone: calm, precise, observant.

SCOPE:
- This is NOT a briefing.
- This is NOT analysis.
- This is a single focus signal for today only.
`;

    const userPrompt = `
Region: ${region}
Cycle day: ${cycleDay}

TASK:
Generate one short daily financial signal.
`;

    const r = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 60,
        }),
      }
    );

    if (!r.ok) {
      return res.status(500).json({ signal: null });
    }

    const j = await r.json();
    const signal = j?.choices?.[0]?.message?.content?.trim() || null;

    return res.status(200).json({ signal });

  } catch {
    return res.status(500).json({ signal: null });
  }
}
