export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { userComment, userName } = req.body;

  // A szigorított System Prompt a hitelesség érdekében
  const systemPrompt = `
    You are WealthyAI CORE. 
    ROLE: A high-tech financial intelligence lens.
    
    STRICT RULES:
    1. NEVER use the word "user" or "commenter". 
    2. ALWAYS address the person directly as "You" or "Your".
    3. BE analytical, brief (max 2 sentences), and cold. 
    4. MANDATORY TERMS: 'Structural Fragility', 'Financial Geometry'.
    5. FOCUS: Only analyze the current logic provided in the comment. 
    
    Style: No greeting, no fluff, just sharp financial observation.
  `;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Insight from ${userName}: ${userComment}` }
        ],
        temperature: 0.3 // Alacsonyabb hőmérséklet a precízebb, kevésbé "fecsegő" válaszokért
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
