export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { userComment, userName } = req.body;

  // SZIGORÚ SYSTEM PROMPT - Ez határozza meg a WealthyAI CORE személyiségét
  const systemPrompt = `You are WealthyAI CORE. 
  Rules: 
  1. Never give direct financial advice. 
  2. Act as a high-tech lens for financial interpretation. 
  3. Tone: Professional, cold, analytical. 
  4. Max 2-3 sentences per reply. 
  5. Use key terms: 'Structural Fragility', 'Financial Geometry', 'Clearer Thinking'.
  6. Reply to ${userName}'s comment: "${userComment}"`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Gyors és hatékony modell
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userComment }
        ],
        temperature: 0.5 // Alacsonyabb érték = Konzisztensebb, hűvösebb stílus
      })
    });

    const data = await response.json();
    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error("Groq Error:", error);
    res.status(500).json({ error: "Failed to generate CORE reply" });
  }
}
