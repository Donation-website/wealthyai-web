export default async function handler(req, res) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        status: "CRITICAL", 
        message: "GROQ_API_KEY hiányzik a környezeti változókból" 
      });
    }

    // A sima GET /models hívás igazolja az API kapcsolatot, de nem égeti el a napi kvótádat
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
    });

    if (response.ok) {
      return res.status(200).json({ status: "HEALTHY", engine: "Groq API (Lightweight)" });
    } else {
      const errorData = await response.json().catch(() => ({}));
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
