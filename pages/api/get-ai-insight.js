import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Csak a POST kéréseket engedjük át
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // A Te Gemini API kulcsod
  const apiKey = "AIzaSyD2l3DBUbct-vzBiIQcmzTCXnS6GcMF690";
  
  // Adatok kinyerése a kérésből
  const { income, fixed, variable } = req.body;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // A legstabilabb modellnév használata, ami elkerüli a 404-es hibát
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Pénzügyi szakértői utasítás (Prompt)
    const prompt = `You are a professional financial advisor. My monthly income is ${income} USD. 
    My fixed costs are ${fixed}, and variable costs are ${variable}. 
    Give 3 very short, professional bullet-point financial tips in English to optimize my savings. 
    Be specific, encouraging, and keep it under 50 words.`;

    // Tartalom generálása
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Ha nincs válasz, hibát dobunk
    if (!text) {
      throw new Error("No response text from AI");
    }

    // Siker esetén visszaküldjük a választ
    res.status(200).json({ insight: text });

  } catch (error) {
    console.error("AI Error Details:", error);
    
    // Ha a 1.5-flash még mindig nem érhető el, próbáljuk meg a gemini-pro-t tartalékként
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const backupModel = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await backupModel.generateContent(`Income: ${income}, Expenses: ${fixed + variable}. Give 1 short tip.`);
        const response = await result.response;
        res.status(200).json({ insight: response.text() });
    } catch (finalError) {
        res.status(500).json({ error: "AI service is currently unavailable in your region. Please try again later." });
    }
  }
}
