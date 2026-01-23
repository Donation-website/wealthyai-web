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
    try {
      const res = await fetch('/api/get-ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      // Itt a javítás: ha nincs insight, kiírjuk a hibaüzenetet
      setAiResponse(data.insight || data.error || "No response. Please try again.");
    } catch (e) {
      setAiResponse("Connection error.");
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#04080F', color: 'white', minHeight: '100vh', padding: '30px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#00ff88' }}>WealthyAI PRO Studio</h1>
        
        {/* INTERAKTÍV MEZŐK */}
        <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
          {['income', 'fixed', 'variable'].map(key => (
            <div key={key} style={{ background: '#0D1117', padding: '10px', borderRadius: '8px', border: '1px solid #1A1F26' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#888' }}>{key.toUpperCase()}</label>
              <input 
                type="number" 
                value={userData[key]} 
                style={{ background: 'none', border: 'none', color: '#00ff88', fontWeight: 'bold', outline: 'none' }}
                onChange={(e) => {
                  const d = {...userData, [key]: Number(e.target.value)};
                  setUserData(d);
                  localStorage.setItem('userFinancials', JSON.stringify(d));
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
          <div style={{ background: '#0D1117', padding: '20px', borderRadius: '15px' }}>
            <h3>Wealth Forecast (7% ROI)</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="name" stroke="#555" />
                  <YAxis stroke="#555" />
                  <Tooltip contentStyle={{ background: '#0D1117' }} />
                  <Area type="monotone" dataKey="total" stroke="#00ff88" fill="#00ff88" fillOpacity={0.1} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: '#0D1117', padding: '20px', borderRadius: '15px' }}>
            <h3>🤖 AI Advisor</h3>
            <p style={{ fontSize: '12px', color: '#888' }}>Analyzing: ${userData.income} income...</p>
            <button onClick={askAI} style={{ width: '100%', padding: '12px', background: '#00ff88', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? "GENERATING..." : "GET STRATEGY"}
            </button>
            <div style={{ marginTop: '15px', padding: '15px', background: '#161B22', borderRadius: '8px', minHeight: '150px', fontSize: '14px', lineHeight: '1.6' }}>
              {aiResponse || "Your personalized strategy will appear here."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
