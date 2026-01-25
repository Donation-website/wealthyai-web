export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ insight: "Method not allowed." });
  }

  if (!process.env.HF_TOKEN) {
    return res.status(200).json({ insight: "Hiba: HF_TOKEN hiányzik!" });
  }

  try {
    const { country = "US", weeklyIncome = 0, weeklySpend = 0, dailyTotals = [] } = req.body;

    const prompt = `<s>[INST] Analyze this: Income ${weeklyIncome}, Spend ${weeklySpend}, Daily: ${dailyTotals.join(",")}. Give 2 tips. [/INST]`;

    // ÚJ, STABILABB MODELL URL (Zephyr vagy Llama 3.2)
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

    if (!response.ok) {
      const errorText = await response.text();
      // Ha még mindig 404, próbáljuk meg a Llama modellt
      return res.status(200).json({ insight: `API hiba (${response.status}): Próbálj másik modellt vagy ellenőrizd a végpontot.` });
    }

    const result = await response.json();

    // A válasz kinyerése (Zephyr/Mistral esetén tömb jön vissza)
    let aiText = "";
    const data = Array.isArray(result) ? result[0] : result;
    
    if (data && data.generated_text) {
      aiText = data.generated_text;
    } else {
      aiText = "Ismeretlen válaszformátum.";
    }

    const cleanText = aiText.split("[/INST]").pop().trim();
    return res.status(200).json({ insight: cleanText });

  } catch (err) {
    return res.status(200).json({ insight: `Hiba: ${err.message}` });
  }
}
