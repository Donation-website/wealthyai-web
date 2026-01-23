import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Csak a POST kéréseket engedélyezzük
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // A Te Gemini API kulcsod
  const apiKey = "AIzaSyD2l3DBUbct-vzBiIQcmzTCXnS6GcMF690"; 
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is missing on the server' });
  }

  // Megkapjuk az adatokat a premium.js-től
  const { income, fixed, variable } = req.body;

  // Ellenőrizzük, hogy megérkeztek-e a számok
  if (income === undefined || fixed === undefined || variable === undefined) {
    return res.status(400).json({ error: 'Missing financial data' });
  }

  try {
    // Gemini konfigurálása
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Profi pénzügyi prompt összeállítása
    const prompt = `You are a professional financial advisor. My monthly income is ${income} USD. 
    My fixed costs are ${fixed} USD, and my variable costs are ${variable} USD. 
    Based on these numbers, give 3 very short, professional bullet-point financial tips in English to optimize my savings. 
    Be specific, encouraging, and focus on long-term wealth.`;

    // AI válasz generálása
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Siker esetén visszaküldjük az AI szövegét
    res.status(200).json({ insight: text });

  } catch (error) {
    // Hiba esetén részletesebb logot hagyunk a szerveren, de a kliensnek csak hibaüzenetet küldünk
    console.error("Server-side Gemini Error:", error);
    res.status(500).json({ error: 'AI advisor is currently offline. Please try again.' });
  }
}
