import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PremiumDashboard() {
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({ income: 5000, fixed: 2000, variable: 1500 });

  useEffect(() => {
    const saved = localStorage.getItem('userFinancials');
    if (saved) {
      try {
        setUserData(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing data");
      }
    }
  }, []);

  const monthlySavings = userData.income - (userData.fixed + userData.variable);
  const savingsRate = userData.income > 0 ? (monthlySavings / userData.income) * 100 : 0;

  const chartData = [
    { name: 'Now', total: 0 },
    { name: 'Y1', total: Math.max(0, monthlySavings * 12 * 1.07) },
    { name: 'Y2', total: Math.max(0, monthlySavings * 24 * 1.12) },
    { name: 'Y3', total: Math.max(0, monthlySavings * 36 * 1.18) },
    { name: 'Y5', total: Math.max(0, monthlySavings * 60 * 1.35) },
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
      setAiResponse(data.insight || "No response from AI.");
    } catch (e) {
      setAiResponse("Connection error.");
    }
    setLoading(false);
  };

  const inputGroupStyle = { background: '#0D1117', padding: '10px 15px', borderRadius: '10px', border: '1px solid #1A1F26' };
  const premiumInputStyle = { background: 'none', border: 'none', color: '#00ff88', fontSize: '1.2rem', fontWeight: 'bold', outline: 'none', width: '100%' };
  const statCardStyle = { background: '#0D1117', padding: '20px', borderRadius: '12px', border: '1px solid #1A1F26' };

  return (
    <div style={{ background: '#04080F', color: 'white', minHeight: '100vh', padding: '30px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', color: '#00ff88', margin: 0 }}>WealthyAI PRO</h1>
            <p style={{ opacity: 0.6 }}>Advanced Multi-Scenario Analytics</p>
          </div>
          <button onClick={() => window.location.href='/start'} style={{ background: 'none', border: '1px solid #333', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Back to Start</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          {['income', 'fixed', 'variable'].map((key) => (
            <div key={key} style={inputGroupStyle}>
              <label style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>{key}</label>
              <input 
                type="number" 
                value={userData[key]} 
                onChange={(e) => {
                  const newData = {...userData, [key]: Number(e.target.value)};
                  setUserData(newData);
                  localStorage.setItem('userFinancials', JSON.stringify(newData));
                }}
                style={premiumInputStyle}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
          <div style={statCardStyle}>
            <span style={{ fontSize: '0.7rem', color: '#888' }}>SURPLUS</span>
            <h2 style={{ margin: '5px 0' }}>${monthlySavings.toLocaleString()}</h2>
          </div>
          <div style={statCardStyle}>
            <span style={{ fontSize: '0.7rem', color: '#888' }}>HEALTH</span>
            <h2 style={{ margin: '5px 0', color: savingsRate > 20 ? '#00ff88' : '#ff4d4d' }}>{savingsRate.toFixed(1)}%</h2>
          </div>
          <div style={statCardStyle}>
            <span style={{ fontSize: '0.7rem', color: '#888' }}>5Y WEALTH</span>
            <h2 style={{ margin: '5px 0' }}>${(monthlySavings * 60 * 1.25).toLocaleString()}</h2>
          </div>
          <div style={statCardStyle}>
            <span style={{ fontSize: '0.7rem', color: '#888' }}>RANK</span>
            <h2 style={{ margin: '5px 0' }}>{savingsRate > 30 ? 'Elite' : 'Standard'}</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
          <div style={{ background: '#0D1117', padding: '25px', borderRadius: '16px', border: '1px solid #1A1F26' }}>
            <h3 style={{ marginBottom: '20px' }}>Wealth Acceleration Forecast</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1F26" vertical={false} />
                  <XAxis dataKey="name" stroke="#555" />
                  <YAxis stroke="#555" />
                  <Tooltip contentStyle={{ background: '#0D1117', border: '1px solid #333' }} />
                  <Area type="monotone" dataKey="total" stroke="#00ff88" fill="#00ff88" fillOpacity={0.1} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: '#0D1117', padding: '25px', borderRadius: '16px', border: '1px solid #1A1F26' }}>
            <h3 style={{ marginBottom: '10px' }}>🤖 Pro AI Insight</h3>
            <button onClick={askAI} style={{ background: '#00ff88', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', width: '100%', cursor: 'pointer', marginBottom: '15px' }} disabled={loading}>
              {loading ? "PROCESSING..." : "GENERATE STRATEGY"}
            </button>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#CCC', whiteSpace: 'pre-line', background: '#161B22', padding: '15px', borderRadius: '8px', minHeight: '180px' }}>
              {aiResponse || "Click the button to start analysis."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
