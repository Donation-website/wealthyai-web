export default async function handler(req, res) {
  // A legfrissebb és aktív Groq modellek fallback tömbben
  const models = [
    "llama-3.3-70b-versatile",
    "llama3-8b-8192"
  ]; 

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: models[0],
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 10
      })
    });

    if (response.ok) {
      return res.status(200).json({ status: "HEALTHY", engine: "Groq Llama 3.3" });
    } else {
      const errorData = await response.json();
      return res.status(500).json({ status: "CRITICAL", message: errorData.error?.message });
    }
  } catch (err) {
    return res.status(500).json({ status: "OFFLINE", error: err.message });
  }
}
