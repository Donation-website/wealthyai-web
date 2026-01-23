import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // USE THE ENVIRONMENT VARIABLE HERE, EXTRACTING YOUR KEY:
  // It is recommended to store this key in the Vercel Dashboard alongside STRIPE_SECRET_KEY!
  const apiKey = "AIzaSyD2l3DBUbct-vzBiIQcmzTCXnS6GcMF690"; 
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { income, fixed, variable } = req.body;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are a professional financial advisor. My monthly income is ${income} USD. 
    My fixed costs are ${fixed}, and variable costs are ${variable}. 
    Give 3 very short, professional bullet-point financial tips in English to optimize my savings. 
    Be specific and encouraging.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ insight: text });
  } catch (error) {
    console.error("Server-side AI Error:", error);
    res.status(500).json({ error: 'Failed to fetch AI insight' });
  }
}
