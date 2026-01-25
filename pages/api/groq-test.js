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
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: "Say OK" }],
          max_tokens: 5,
        }),
      }
    );

    const text = await r.text();
    return res.status(200).send(text);
  } catch (e) {
    return res.status(500).send(e.toString());
  }
}
