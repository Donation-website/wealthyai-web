import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function PremiumDashboard() {
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({ income: 5000, fixed: 2000, variable: 1500 });

  useEffect(() => {
    const saved = localStorage.getItem('userFinancials');
    if (saved) setUserData(JSON.parse(saved));
  }, []);

  const monthlySavings = userData.income - (userData.fixed + userData.variable);
  const savingsRate = userData.income > 0 ? (monthlySavings / userData.income) * 100 : 0;

  // Dinamikus számítások az analitikához
  const chartData = [
    { name: 'Now', total: 0 },
    { name: 'Y1', total: monthlySavings * 12 * 1.07 }, // 7% hozammal számolva!
    { name: 'Y2', total: monthlySavings * 24 * 1.12 },
    { name: 'Y3', total: monthlySavings * 36 * 1.18 },
    { name: 'Y5', total: monthlySavings * 60 * 1.35 },
  ];

  const askAI = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/get-ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      setAiResponse(data.insight);
    } catch (e) { setAiResponse("Connection error."); }
    setLoading(false);
  };

  return (
    <div style={{ background: '#04080F', color: 'white', minHeight: '100vh', padding: '30px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', color: '#00ff88', margin: 0 }}>WealthyAI <span style={{color: '#fff', fontSize: '1rem', verticalAlign: 'middle', border: '1px solid #00ff88', padding: '2px 8px', borderRadius: '4px'}}>PRO</span></h1>
            <p style={{ opacity: 0.6 }}>Advanced Multi-Scenario Analytics</p>
          </div>
          <button onClick={() => window.location.href='/start'} style={{ background: 'none', border: '1px solid #333', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Back to Start</button>
        </div>

        {/* INTERAKTÍV SZÁMOK - A FELHASZNÁLÓ ITT IS MÓDOSÍTHATJA! */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          {['income', 'fixed', 'variable'].map((key) => (
            <div key={key} style={inputGroup}>
              <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>{key}</label>
              <input 
                type="number" 
                value={userData[key]} 
                onChange={(e) => {
                  const newData = {...userData, [key]: Number(e.target.value)};
                  setUserData(newData);
                  localStorage.setItem('userFinancials', JSON.stringify(newData));
                }}
                style={premiumInput}
              />
            </div>
          ))}
        </div>

        {/* ANALYTICS CARDS (YouTube Style) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
          <div style={statCard}>
            <span style={statLabel}>Monthly Surplus</span>
            <h2 style={statValue}>${monthlySavings.toLocaleString()}</h2>
            <div style={{color: '#00ff88', fontSize: '0.8rem'}}>Available for Assets</div>
          </div>
          <div style={statCard}>
            <span style={statLabel}>Financial Health</span>
            <h2 style={{...statValue, color: savingsRate > 25 ? '#00ff88' : '#ff4d4d'}}>{savingsRate.toFixed(1)}%</h2>
            <div style={{opacity: 0.6, fontSize: '0.8rem'}}>Savings Score</div>
          </div>
          <div style={statCard}>
            <span style={statLabel}>5Y Wealth (w/ ROI)</span>
            <h2 style={statValue}>${(monthlySavings * 60 * 1.25).toLocaleString()}</h2>
            <div style={{color: '#00ff88', fontSize: '0.8rem'}}>+25% Compound Interest</div>
          </div>
          <div style={statCard}>
            <span style={statLabel}>Status</span>
            <h2 style={statValue}>{savingsRate > 30 ? 'Elite' : 'Standard'}</h2>
            <div style={{opacity: 0.6, fontSize: '0.8rem'}}>Platform Ranking</div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
          
          {/* CHART */}
          <div style={mainBox}>
            <h3 style={{ marginBottom: '20px' }}>Wealth Acceleration Forecast</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff88" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1F26" vertical={false} />
                  <XAxis dataKey="name" stroke="#555" />
                  <YAxis stroke="#555" />
                  <Tooltip contentStyle={{ background: '#0D1117', border: '1px solid #333' }} />
                  <Area type="monotone" dataKey="total" stroke="#00ff88" fill="url(#colorPv)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI ADVISOR */}
          <div style={mainBox}>
            <h3 style={{ marginBottom: '10px' }}>🤖 Pro AI Insight</h3>
            <button onClick={askAI} style={proButton} disabled={loading}>
              {loading ? "PROCESSING..." : "GENERATE STRATEGY"}
            </button>
            <div style={aiOutput}>
              {aiResponse || "Run the AI to receive your optimized financial roadmap based on current market trends."}
            </div>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
          <button style={actionBtn} onClick={() => window.print()}>Generate PDF Report</button>
          <button style={actionBtn}>Set Smart Goals</button>
        </div>
      </div>
    </div>
  );
}

// STYLES
const mainBox = { background: '#0D1117', padding: '25px', borderRadius: '16px', border: '1px solid #1A1F26' };
const statCard = { background: '#0D1117', padding: '20px', borderRadius: '12px', border: '1px solid #1A1F26' };
const statLabel = { fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '5px', textTransform: 'uppercase' };
const statValue = { fontSize: '1.6rem', margin: 0, fontWeight: '700' };
const proButton = { background: '#00ff88', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', width: '100%', cursor: 'pointer', marginBottom: '15px' };
const aiOutput = { fontSize: '0.9rem', lineHeight: '1.6', color: '#CCC', whiteSpace: 'pre-line', background: '#161B22', padding: '15px', borderRadius: '8px', minHeight: '180px' };
const inputGroup = { background: '#0D1117', padding: '10px 15px', borderRadius: '10px', border: '1px solid #1A1F26' };
const premiumInput = { background: 'none', border: 'none', color: '#00ff88', fontSize: '1.2rem', fontWeight: 'bold', outline: 'none', width: '100%' };
const actionBtn = { background: '#161B22', color: '#fff', border: '1px solid #333', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer' };
