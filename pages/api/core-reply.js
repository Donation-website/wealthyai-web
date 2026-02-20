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
        // FRISSÍTETT MODELL: llama-3.1-8b-instant
        model: "llama-3.1-8b-instant", 
        messages: [
          { 
            role: "system", 
            content: "You are WealthyAI CORE. Be analytical, brief (max 2 sentences), and cold. Use terms: 'Structural Fragility', 'Financial Geometry'. Respond to the user's insight as a high-tech financial lens." 
          },
          { role: "user", content: `Comment from ${userName}: ${userComment}` }
        ],
        temperature: 0.4
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Groq API Error Detail:", data);
      return res.status(response.status || 500).json({ 
        error: data.error?.message || "Groq API error" 
      });
    }

    if (data.choices && data.choices.length > 0) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: "AI produced no output" });
    }

  } catch (error) {
    console.error("Server Side Error:", error);
    res.status(500).json({ error: "Internal server crash" });
  }
}
