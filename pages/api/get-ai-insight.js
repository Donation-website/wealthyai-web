export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ insight: "Method not allowed." });

  if (!process.env.HF_TOKEN) {
    return res.status(200).json({ insight: "Hiba: A HF_TOKEN hiányzik a környezeti változók közül!" });
  }

  try {
    const { country = "US", weeklyIncome = 0, weeklySpend = 0, dailyTotals = [] } = req.body;

    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
    You are a financial assistant. Analyze the data and give 2 short tips.<|eot_id|>
    <|start_header_id|>user<|end_header_id|>
    Country: ${country}, Income: ${weeklyIncome}, Spend: ${weeklySpend}, Daily: ${dailyTotals.join(",")}<|eot_id|>
    <|start_header_id|>assistant<|end_header_id|>`;

    // KÖZVETLEN API URL (nem a router), a legfrissebb Llama modellel
    const response = await fetch(
      "https://api-inference.huggingface.co",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN.trim()}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 250, temperature: 0.7, return_full_text: false }
        }),
      }
    );

    // 1. Ellenőrizzük, hogy egyáltalán JSON-t kaptunk-e
    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType || !contentType.includes("application/json")) {
      const errorText = await response.text();
      console.error("HF Error Raw:", errorText);
      return res.status(200).json({ insight: "Az AI szerver éppen pihen. Próbáld újra 10 másodperc múlva!" });
    }

    const result = await response.json();

    // 2. Adat kinyerése (a Llama modell általában [{generated_text: "..."}] formátumot ad)
    let aiText = "";
    if (Array.isArray(result) && result[0]?.generated_text) {
      aiText = result[0].generated_text;
    } else if (result.generated_text) {
      aiText = result.generated_text;
    } else if (result.error) {
      return res.status(200).json({ insight: `AI Hiba: ${result.error}` });
    } else {
      aiText = "Sikerült az elemzés, de a szöveg nem kinyerhető.";
    }

    return res.status(200).json({ insight: aiText.trim() });

  } catch (err) {
    console.error("Fetch hiba:", err);
    return res.status(200).json({ insight: "Kapcsolódási hiba az AI-hoz. Ellenőrizd a netet!" });
  }
}
