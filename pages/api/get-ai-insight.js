import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = "AIzaSyD2l3DBUbct-vzBiIQcmzTCXnS6GcMF690";
  const { income, fixed, variable } = req.body;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // STABILABB MODELL HASZNÁLATA
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Financial Advisor Mode. Income: ${income}, Fixed: ${fixed}, Variable: ${variable}. Give 3 short, professional money-saving tips in English. Bullet points only. Max 50 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("No response from AI");
    res.status(200).json({ insight: text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
}
