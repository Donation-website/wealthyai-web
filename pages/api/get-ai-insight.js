export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { income, fixed, variable } = req.body;

  try {
    // Ingyenes, stabil AI modell (Mistral-7B) meghívása
    const response = await fetch(
      "https://api-inference.huggingface.co",
      {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] You are a professional WealthAI Advisor. 
          Monthly Income: $${income}, Fixed Costs: $${fixed}, Variable Costs: $${variable}.
          Give 3 specific, advanced financial strategies in English to maximize wealth. 
          Be aggressive and professional. Bullet points only. [/INST]`,
        }),
      }
    );

    const result = await response.json();
    let text = result[0]?.generated_text || "";
    
    // Csak a választ vágjuk ki, ha benne maradt a prompt
    const cleanText = text.split('[/INST]').pop().trim();

    res.status(200).json({ insight: cleanText || "AI is calibrating, please try again." });
  } catch (error) {
    res.status(500).json({ error: "AI Engine error" });
  }
}
Körültekintően használja a kódot.

2. A Prémium Dashboard (Eladható Funkciókkal)
Ezt az oldalt teljesen átalakítottam. Most már interaktív: a felhasználó itt is állíthatja a számokat, látja a "százalékos egészségét" és valódi diagramokat kap.
Fájl: pages/premium.js
javascript
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function PremiumDashboard() {
