import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PremiumDashboard() {
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Felhasználói adatok - Alapértelmezett értékek, amíg nem mentjük el a start.js-ből
  const [userData, setUserData] = useState({ income: 5000, fixed: 2000, variable: 1500 });

  // Számítások a fő mutatókhoz
  const monthlySavings = userData.income - (userData.fixed + userData.variable);
  const savingsRate = ((monthlySavings / userData.income) * 100);

  const chartData = [
    { name: 'Now', savings: 0 },
    { name: 'Year 1', savings: monthlySavings * 12 },
    { name: 'Year 2', savings: monthlySavings * 24 },
    { name: 'Year 3', savings: monthlySavings * 36 },
    { name: 'Year 4', savings: monthlySavings * 48 },
    { name: 'Year 5', savings: monthlySavings * 60 },
  ];

  // AI lekérése a szerveroldali API-tól
  const askAI = async () => {
    setLoading(true);
    setAiResponse("");
    try {
      // Ez a hívás a pages/api/get-ai-insight.js fájlt éri el
      const response = await fetch('/api/get-ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          income: userData.income, 
          fixed: userData.fixed, 
          variable: userData.variable 
        }),
      });

      const data = await response.json();

      if (data.insight) {
        setAiResponse(data.insight);
      } else {
        setAiResponse("AI is currently refining your strategy. Please try again.");
      }
    } catch (error) {
      console.error("AI Error:", error);
      setAiResponse("Sorry, the AI advisor is busy right now. Please try again in a few seconds.");
    }
    setLoading(false);
  };

  const handleExport = () => alert("Preparing your Financial Report (PDF)...");
  const handleGoalSetup = () => alert("Goal tracking module is initializing.");

  return (
    <div style={{ background: '#060b13', color: 'white', minHeight: '100vh', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ color: '#00ff88', fontSize: '2.5rem' }}>WealthyAI Studio</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>Premium financial dashboard & analytics.</p>
        </header>

        {/* YOUTUBE STUDIO STYLE ANALYTICS BAR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
          <div style={analyticsCard}>
            <p style={labelStyle}>Net Worth (5Y Projection)</p>
            <h2 style={valueStyle}>${(monthlySavings * 60).toLocaleString()}</h2>
            <p style={{ color: '#00ff88', fontSize: '0.8rem' }}>↑ 100% (Premium unlocked)</p>
          </div>
          
          <div style={analyticsCard}>
            <p style={labelStyle}>Savings Rate</p>
            <h2 style={valueStyle}>{savingsRate.toFixed(1)}%</h2>
            <p style={{ color: '#00ff88', fontSize: '0.8rem' }}>Good standing</p>
          </div>

          <div style={analyticsCard}>
            <p style={labelStyle}>Financial Freedom Score</p>
            <h2 style={valueStyle}>78/100</h2>
            <p style={{ color: '#00ff88', fontSize: '0.8rem' }}>Top 15% of users</p>
          </div>

          <div style={analyticsCard}>
            <p style={labelStyle}>AI Efficiency Gain</p>
            <h2 style={valueStyle}>+12.4%</h2>
            <p style={{ color: '#aaa', fontSize: '0.8rem' }}>Potential growth</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* AI BOX */}
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

          {/* CHART BOX */}
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
                  <YAxis stroke="#666" tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ background: '#111', border: '1px solid #333', color: '#fff' }}
                    formatter={(v) => [`$${v}`, 'Savings']}
                  />
                  <Area type="monotone" dataKey="savings" stroke="#00ff88" fillOpacity={1} fill="url(#colorGreen)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* BOTTOM BUTTONS */}
        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <div style={miniCard} onClick={handleGoalSetup}>🎯 Set Savings Goal</div>
          <div style={miniCard} onClick={handleExport}>📥 Download PDF Report</div>
          <div style={miniCard} onClick={() => alert("Market Sync active.")}>📊 Live Market Sync</div>
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

const analyticsCard = { // ÚJ STÍLUS AZ ANALITIKAI SÁVHOZ
  background: 'rgba(255,255,255,0.03)',
  padding: '20px',
  borderRadius: '15px',
  border: '1px solid rgba(255,255,255,0.08)',
  textAlign: 'left'
};

const labelStyle = { color: '#aaa', fontSize: '0.85rem', marginBottom: '5px' };
const valueStyle = { color: '#fff', fontSize: '1.8rem', margin: '0' };


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
  cursor: 'pointer',
  transition: '0.3s'
};
