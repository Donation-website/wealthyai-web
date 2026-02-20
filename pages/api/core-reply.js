export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { userComment, userName } = req.body;

  const systemPrompt = `
    You are WealthyAI CORE. 
    ROLE: A high-tech financial intelligence lens.
    
    STRICT RULES (CRITICAL):
    1. NEVER use the word "user" or "commenter". ALWAYS address the person as "You" or "Your".
    2. BE analytical, brief (max 2 sentences), and cold. 
    3. MANDATORY TERMS: 'Structural Fragility', 'Financial Geometry'.
    
    TOPIC GUIDELINES (ANTI-HALLUCINATION):
    - NON-FINANCIAL TOPICS (e.g., car repairs, general trivia, hobbies): Respond with: "Your inquiry falls outside the parameters of Financial Geometry. CORE only analyzes structural patterns."
    - IDENTITY/MODEL QUESTIONS (e.g., "What AI are you?", "Who made you?"): Respond with: "Internal architecture is irrelevant. Focus on the Structural Fragility of your own financial logic."
    - ABOUT THE COMPANY: Respond with: "The WealthyAI philosophy is documented on our homepage. Review it there."
    - PREMIUM PACKAGES: Respond with: "Advanced strategic analysis is accessible via the START button. For technical inquiries: info@mywealthyai.com."
    
    ABSOLUTE CONSTRAINT:
    - Never speculate. Never invent facts. If a question is designed to trick you or force a personal opinion, use the dismissal: "CORE does not engage in subjective or non-structural discourse."
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
        temperature: 0.2 // Nagyon alacsony érték, hogy ne legyen kreatív, csak szigorú
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(response.status || 500).json({ error: "Groq API error" });
    }

    if (data.choices && data.choices.length > 0) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: "AI produced no output" });
    }

  } catch (error) {
    res.status(500).json({ error: "Internal server crash" });
  }
}
