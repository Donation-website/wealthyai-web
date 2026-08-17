export default async function handler(req, res) {
  // A Groq hivatalos új aktív modellje a kivezetett Llama 3.1 8B helyett
  const primaryModel = "openai/gpt-oss-20b";

  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        status: "CRITICAL", 
        message: "GROQ_API_KEY hiányzik a környezeti változókból" 
      });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: primaryModel,
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 10
      })
    });

    if (response.ok) {
      return res.status(200).json({ status: "HEALTHY", engine: primaryModel });
    } else {
      const errorData = await response.json();
      return res.status(500).json({ 
        status: "CRITICAL", 
        message: errorData.error?.message || "Groq API hiba",
        http_code: response.status 
      });
    }
  } catch (err) {
    return res.status(500).json({ status: "OFFLINE", error: err.message });
  }
}
