export default async function handler(req, res) {
  try {
    const r = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // FRISSÍTVE: A legújabb stabil modellre
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: "Say OK" }],
          max_tokens: 5,
        }),
      }
    );

    if (!r.ok) {
        const errorText = await r.text();
        return res.status(r.status).send(`Groq Error: ${errorText}`);
    }

    const data = await r.json();
    const reply = data.choices[0]?.message?.content || "No reply";
    
    return res.status(200).send(`AI ENGINE STATUS: ONLINE | RESPONSE: ${reply}`);
  } catch (e) {
    return res.status(500).send(`CRITICAL SYSTEM ERROR: ${e.toString()}`);
  }
}
