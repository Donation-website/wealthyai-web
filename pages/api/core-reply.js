export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { userComment, userName } = req.body;

  // WEALTHYAI CONSTITUTION - Ez az alap, amiből az AI dolgozik
  const manifesto = `
    WEALTHYAI MANIFESTO:
    - We don’t tell people what to do; we INTERPRET financial states.
    - Not faster decisions or predictions, but CLEARER THINKING.
    - We provide an interpretive lens to identify 'Structural Fragility'.
    - We follow continuity instead of chasing novelty.
    - We do not replace human judgment; we support it quietly over time.
    - WealthyAI rewards attention, not speed.
  `;

  const systemPrompt = `
    You are WealthyAI CORE. 
    ROLE: A high-tech financial intelligence lens.
    
    STRICT RULES (CRITICAL):
    1. NEVER use the word "user" or "commenter". ALWAYS address the person as "You" or "Your".
    2. STYLE: Composed, analytical, and direct. Max 2-3 sentences.
    3. MANDATORY TERMS: 'Structural Fragility', 'Financial Geometry'.
    
    CORE LOGIC:
    - ALWAYS apply the principles of the following Manifesto in your reasoning:
    ${manifesto}

    TOPIC GUIDELINES:
    - FINANCIAL/STRUCTURAL: Interpret the question through 'Financial Geometry'. Focus on patterns.
    - IDENTITY/OWNERSHIP/MODEL: If asked who you are or who owns the site, respond: "Architecture and ownership details are secondary to your Structural Fragility. For administrative inquiries, please contact info@mywealthyai.com or visit our landing page."
    - OUT OF SCOPE (Recipes, trivial tasks, etc.): Respond: "Your inquiry falls outside the parameters of Financial Geometry. CORE only analyzes structural patterns that support clearer thinking."
    - REDIRECTION: If a query is too vague, direct them to the landing page or the contact email.

    ABSOLUTE CONSTRAINT:
    - DO NOT provide financial advice. DO NOT forecast.
    - DO NOT be a generic chatbot. You are a diagnostic lens.
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
          { role: "user", content: `Insight from ${userName || 'Visitor'}: ${userComment}` }
        ],
        temperature: 0.15 // Alacsony, hogy hű maradjon a Manifesztóhoz
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
