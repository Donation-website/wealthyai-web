import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = "AIzaSyD2l3DBUbct-vzBiIQcmzTCXnS6GcMF690";
  const { income, fixed, variable } = req.body;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a financial advisor. Income: ${income}, Fixed costs: ${fixed}, Variable: ${variable}. Give 3 short, professional money-saving tips in English. Bullet points only.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ insight: text });
  } catch (error) {
    console.error("Gemini hiba (valószínűleg régió):", error);
    
    // MENTŐÖV: Ha az AI nem elérhető, generálunk egy okos választ a számokból
    const savings = income - (fixed + variable);
    const savingsRate = ((savings / income) * 100).toFixed(1);
    
    const fallbackTips = [
      `• Your current savings rate is ${savingsRate}%. We recommend reaching 20% by auditing your variable costs.`,
      `• Follow the 50/30/20 rule: $${(income * 0.5).toFixed(0)} for needs, $${(income * 0.3).toFixed(0)} for wants, and $${(income * 0.2).toFixed(0)} for savings.`,
      `• Setup an automated $${(savings * 0.15).toFixed(0)} transfer to an investment account to leverage compound interest.`
    ];
    
    res.status(200).json({ insight: fallbackTips.join('\n') });
  }
}
