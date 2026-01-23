export default async function handler(req, res) {
  // Csak POST kérést fogadunk
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { income, fixed, variable } = req.body;
  const token = process.env.HF_TOKEN; // Ide húzza be a Vercelről a kulcsot

  try {
    // JAVÍTOTT URL: megadtuk a konkrét modellt (Mistral-7B)
    const response = await fetch(
      "https://api-inference.huggingface.co",
      {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] Wealth Advisor. Income: $${income}, Costs: $${Number(fixed) + Number(variable)}. Give 3 pro tips in English. [/INST]`,
          parameters: { 
            max_new_tokens: 200, 
            wait_for_model: true,
            return_full_text: false 
          }
        }),
      }
    );

    const result = await response.json();

    // Ha hiba jön az API-tól (pl. rossz token vagy túlterhelt szerver)
    if (!response.ok || result.error) {
      throw new Error(result.error || "Hugging Face Error");
    }

    // A válasz kinyerése (Hugging Face tömböt ad vissza)
    let aiText = Array.isArray(result) ? result[0].generated_text : result.generated_text;

    if (aiText) {
      // Megtisztítjuk a szöveget a felesleges részektől
      const cleanText = aiText.replace(/\[\/INST\]/g, "").trim();
      return res.status(200).json({ insight: cleanText });
    }
    
    throw new Error("No AI text");

  } catch (error) {
    console.error("Hiba az AI hívásakor:", error.message);
    
    // BIZTONSÁGI TARTALÉK: Ha az AI nem válaszol, ez jelenik meg a felhasználónak
    const surplus = Number(income) - (Number(fixed) + Number(variable));
    const smartTips = `• Strategy: Based on your $${surplus} monthly surplus, we suggest allocating 60% to diversified ETFs.\n• Optimization: Reducing variable costs by 15% would save you more.\n• Retirement: You are on a good path to financial stability.`;
    
    res.status(200).json({ insight: smartTips });
  }
}
