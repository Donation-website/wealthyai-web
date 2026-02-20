export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { userComment, userName } = req.body;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", 
        messages: [
          { 
            role: "system", 
            content: "You are WealthyAI CORE. Be analytical, brief (max 2 sentences), and cold. Use terms: 'Structural Fragility', 'Financial Geometry'. Reply to the user's comment." 
          },
          { role: "user", content: `Comment from ${userName}: ${userComment}` }
        ],
        temperature: 0.5
      })
    });

    const data = await response.json();

    // ELLENŐRZÉS: Ha a Groq hibát küld (pl. Auth hiba vagy Rate limit)
    if (!response.ok || data.error) {
      console.error("Groq API Error Detail:", data);
      return res.status(response.status || 500).json({ 
        error: data.error?.message || "Groq API returned an error" 
      });
    }

    // ELLENŐRZÉS: Van-e benne válasz?
    if (data.choices && data.choices.length > 0) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      console.error("Empty choices from Groq:", data);
      res.status(500).json({ error: "No response generated from AI" });
    }

  } catch (error) {
    console.error("Server Crash Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
