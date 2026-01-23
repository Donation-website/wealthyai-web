// pages/premium.js
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const { GoogleGenerativeAI } = require("@google/generative-ai");

export default function PremiumDashboard() {
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Alapértelmezett adatok (később LocalStorage-ból jöhetnek)
  const [userData, setUserData] = useState({ income: 5000, fixed: 2000, variable: 1500 });

  // Számítások a grafikonhoz
  const monthlySavings = userData.income - (userData.fixed + userData.variable);
  const chartData = [
    { name: 'Most', savings: 0 },
    { name: '1. év', savings: monthlySavings * 12 },
    { name: '2. év', savings: monthlySavings * 24 },
    { name: '3. év', savings: monthlySavings * 36 },
    { name: '4. év', savings: monthlySavings * 48 },
    { name: '5. év', savings: monthlySavings * 60 },
  ];

  const askAI = async () => {
    setLoading(true);
    try {
      // A megadott Gemini kulcsod beillesztve
      const genAI = new GoogleGenerativeAI("AIzaSyD2l3DBUbct-vzBiIQcmzTCXnS6GcMF690");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `You are a financial advisor. My monthly income is ${userData.income} USD. 
      My fixed costs are ${userData.fixed}, and variable costs are ${userData.variable}. 
      Give 3 very short, bullet-point financial tips in English to optimize my savings.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiResponse(response.text());
    } catch (error) {
      console.error(error);
      setAiResponse("AI service is currently unavailable. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#060b13', color: 'white', minHeight: '100vh', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ color: '#00ff88', fontSize: '2.8rem', marginBottom: '10px' }}>🎉 Welcome to WealthyAI Premium</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Sikeres fizetés! A prémium funkciók aktiválva.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* AI BOX */}
          <div style={cardStyle}>
            <h3 style={{ color: '#00ff88', marginBottom: '15px' }}>🤖 AI Financial Advisor</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '20px' }}>
              Személyre szabott elemzés a megadott adatai alapján.
            </p>
            <button onClick={askAI} style={buttonStyle} disabled={loading}>
              {loading ? "Elemzés folyamatban..." : "AI Tanácsadás Indítása"}
            </button>
            
            <div style={aiResultBox}>
              {aiResponse || "Kattintson a gombra a mesterséges intelligencia elemzéséhez."}
            </div>
          </div>

          {/* CHART BOX */}
          <div style={cardStyle}>
            <h3 style={{ color: '#00ff88', marginBottom: '15px' }}>📈 5 Éves Vagyonterv</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '20px' }}>
              Várható megtakarítás havi {monthlySavings} $ félretételével.
            </p>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff88" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', color: '#fff' }} />
                  <Area type="monotone" dataKey="savings" stroke="#00ff88" fillOpacity={1} fill="url(#colorGreen)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* CÉLOK ÉS EXPORT */}
        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <div style={miniCard}>🎯 Goal: Savings Target</div>
          <div style={miniCard}>📥 Export: PDF Report</div>
          <div style={miniCard}>📊 Live Market Sync</div>
        </div>

      </div>
    </div>
  );
}

// Stílusok
const cardStyle = {
  background: 'rgba(255,255,255,0.05)',
  padding: '30px',
  borderRadius: '24px',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
};

const buttonStyle = {
  background: '#00ff88',
  color: '#060b13',
  border: 'none',
  padding: '14px 20px',
  borderRadius: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
  width: '100%',
  fontSize: '1rem',
  transition: 'transform 0.2s'
};

const aiResultBox = {
  marginTop: '20px',
  padding: '15px',
  background: 'rgba(0,0,0,0.2)',
  borderRadius: '12px',
  fontSize: '0.95rem',
  lineHeight: '1.6',
  minHeight: '100px',
  borderLeft: '4px solid #00ff88'
};

const miniCard = {
  background: 'rgba(255,255,255,0.03)',
  padding: '15px 25px',
  borderRadius: '15px',
  border: '1px solid rgba(255,255,255,0.05)',
  fontSize: '0.9rem',
  color: '#aaa'
};
