export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ insight: "Method not allowed." });
  }

  // 1. TOKEN ELLENŐRZÉSE
  if (!process.env.HF_TOKEN) {
    return res.status(200).json({ 
      insight: "Hiba: A HF_TOKEN hiányzik a környezeti változók közül (.env.local)!" 
    });
  }

  try {
    const { country = "US", weeklyIncome = 0, weeklySpend = 0, dailyTotals = [] } = req.body;

    const prompt = `<s>[INST] Analyze financial data: Country: ${country}, Income: ${weeklyIncome}, Spend: ${weeklySpend}, Daily: ${dailyTotals.join(",")}. Give 2 tips. [/INST]`;

    console.log("Indul a hívás a Hugging Face-re...");

    const response = await fetch(
      "https://router.huggingface.co",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN.trim()}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 300, temperature: 0.7 }
        }),
      }
    );

    // Ha a válasz nem OK (pl. 401 Unauthorized vagy 404)
    if (!response.ok) {
      const errorData = await response.text();
      console.error("HF API Hiba:", errorData);
      return res.status(200).json({ insight: `API hiba (${response.status}): ${errorData.slice(0, 100)}` });
    }

    const result = await response.json();

    // Adat kinyerése a listából
    let aiText = "";
    if (Array.isArray(result) && result[0]?.generated_text) {
      aiText = result[0].generated_text;
    } else if (result.generated_text) {
      aiText = result.generated_text;
    } else {
      aiText = "Az AI válasz formátuma ismeretlen.";
    }

    // Tisztítás: Csak az AI válasza kell az [/INST] után
    const cleanText = aiText.includes("[/INST]") 
      ? aiText.split("[/INST]").pop().trim() 
      : aiText.trim();

    return res.status(200).json({ insight: cleanText });

  } catch (err) {
    console.error("Fetch hiba:", err);
    return res.status(200).json({ 
      insight: `Kapcsolódási hiba: ${err.message}. Ellenőrizd az internetkapcsolatot és a tokent!` 
    });
  }
}
