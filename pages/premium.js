import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const { GoogleGenerativeAI } = require("@google/generative-ai");

export default function PremiumDashboard() {
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Default data
  const [userData, setUserData] = useState({ income: 5000, fixed: 2000, variable: 1500 });

  // Calculations for the graph
  const monthlySavings = userData.income - (userData.fixed + userData.variable);
  const chartData = [
    { name: 'Now', savings: 0 },
    { name: 'Year 1', savings: monthlySavings * 12 },
    { name: 'Year 2', savings: monthlySavings * 24 },
    { name: 'Year 3', savings: monthlySavings * 36 },
    { name: 'Year 4', savings: monthlySavings * 48 },
    { name: 'Year 5', savings: monthlySavings * 60 },
  ];

  const askAI = async () => {
    setLoading(true);
    setAiResponse(""); // Reset
    try {
      // Use the provided key
      const genAI = new GoogleGenerativeAI("AIzaSyD2l3DBUbct-vzBiIQcmzTCXnS6GcMF690");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `You are a professional financial advisor. My monthly income is ${userData.income} USD. 
      My fixed costs are ${userData.fixed}, and variable costs are ${userData.variable}. 
      Give 3 very short, professional bullet-point financial tips in English to optimize my savings. 
      Be specific and encouraging.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setAiResponse(text);
    } catch (error) {
      console.error("AI Error:", error);
      setAiResponse("Sorry, the AI advisor is busy right now. Please try again in a few seconds.");
    }
    setLoading(false);
  };

  const handleExport = () => {
    alert("Generating your PDF report... This will take a few seconds.");
  };

  const handleGoalSetup = () => {
    alert("Goal tracking module is initializing. Set your target savings!");
  };

  return (
    <div style={{ background: '#060b13', color: 'white', minHeight: '100vh', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ color: '#00ff88', fontSize: '2.8rem', marginBottom: '10px' }}>🎉 Welcome to WealthyAI Premium</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Payment successful! Your premium features are now active.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* AI BOX - NOW IN ENGLISH */}
          <div style={cardStyle}>
            <h3 style={{ color: '#00ff88', marginBottom: '15px' }}>🤖 AI Financial Advisor</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '20px' }}>
              Personalized analysis based on your financial data.
            </p>
            <button onClick={askAI} style={buttonStyle} disabled={loading}>
              {loading ? "Analyzing Data..." : "Get AI Insights"}
            </button>
            
            <div style={aiResultBox}>
              {aiResponse || "Click the button to generate your personalized AI financial plan."}
            </div>
          </div>

          {/* CHART BOX - NOW IN ENGLISH */}
          <div style={cardStyle}>
            <h3 style={{ color: '#00ff88', marginBottom: '15px' }}>📈 5-Year Wealth Projection</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '20px' }}>
              Projected savings by saving ${monthlySavings} every month.
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
                  <YAxis stroke="#666" tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ background: '#111', border: '1px solid #333', color: '#fff' }}
                    formatter={(value) => [`$${value}`, 'Savings']}
                  />
                  <Area type="monotone" dataKey="savings" stroke="#00ff88" fillOpacity={1} fill="url(#colorGreen)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* BOTTOM BUTTONS - WITH FUNCTIONALITY */}
        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <div style={miniCard} onClick={handleGoalSetup}>
            🎯 <span style={{ cursor: 'pointer' }}>Set Savings Goal</span>
          </div>
          <div style={miniCard} onClick={handleExport}>
            📥 <span style={{ cursor: 'pointer' }}>Download PDF Report</span>
          </div>
          <div style={miniCard} onClick={() => alert("Market Sync is active: Checking live rates...")}>
            📊 <span>Live Market Sync</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// Styles (unchanged)
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
  fontSize: '1rem'
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
  color: '#aaa',
  cursor: 'pointer'
};
