import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PremiumDashboard() {
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({ income: 5000, fixed: 2000, variable: 1500 });

  useEffect(() => {
    const saved = localStorage.getItem('userFinancials');
    if (saved) setUserData(JSON.parse(saved));
  }, []);

  const monthlySavings = userData.income - (userData.fixed + userData.variable);
  const chartData = [
    { name: 'Now', total: 0 },
    { name: 'Y1', total: Math.max(0, monthlySavings * 12 * 1.07) },
    { name: 'Y2', total: Math.max(0, monthlySavings * 24 * 1.12) },
    { name: 'Y5', total: Math.max(0, monthlySavings * 60 * 1.35) },
  ];

  const askAI = async () => {
    setLoading(true);
    setAiResponse("");
    try {
      const res = await fetch('/api/get-ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      
      if (data.insight) {
        setAiResponse(data.insight);
      } else if (data.error) {
        setAiResponse("Server Error: " + data.error);
      } else {
        setAiResponse("Unexpected response from server.");
      }
    } catch (e) {
      setAiResponse("Network Error: Could not reach the API. Check your Vercel logs.");
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#04080F', color: 'white', minHeight: '100vh', padding: '30px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: '#00ff88' }}>WealthyAI PRO</h1>
        
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          {['income', 'fixed', 'variable'].map(key => (
            <div key={key} style={{ background: '#0D1117', padding: '10px', borderRadius: '8px', border: '1px solid #1A1F26' }}>
              <label style={{ fontSize: '10px', color: '#888' }}>{key.toUpperCase()}</label>
              <input 
                type="number" 
                value={userData[key]} 
                style={{ background: 'none', border: 'none', color: '#00ff88', fontWeight: 'bold', outline: 'none', width: '80px' }}
                onChange={(e) => {
                  const d = {...userData, [key]: Number(e.target.value)};
                  setUserData(d);
                  localStorage.setItem('userFinancials', JSON.stringify(d));
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          <div style={{ background: '#0D1117', padding: '20px', borderRadius: '15px' }}>
            <h3>Projection</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <XAxis dataKey="name" stroke="#444" />
                  <YAxis stroke="#444" />
                  <Tooltip contentStyle={{ background: '#0D1117' }} />
                  <Area type="monotone" dataKey="total" stroke="#00ff88" fill="#00ff88" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: '#0D1117', padding: '20px', borderRadius: '15px' }}>
            <h3>🤖 AI Advisor</h3>
            <button onClick={askAI} disabled={loading} style={{ width: '100%', padding: '12px', background: '#00ff88', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', color: '#000' }}>
              {loading ? "CONSULTING..." : "GET STRATEGY"}
            </button>
            <div style={{ marginTop: '15px', padding: '15px', background: '#161B22', borderRadius: '8px', minHeight: '150px', fontSize: '13px', lineHeight: '1.6', borderLeft: '3px solid #00ff88' }}>
              {aiResponse || "Click the button to generate strategy."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
