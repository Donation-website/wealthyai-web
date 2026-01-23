import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function PremiumDashboard() {
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({ income: 5000, fixed: 2000, variable: 1500 });

  useEffect(() => {
    const saved = localStorage.getItem('userFinancials');
    if (saved) setUserData(JSON.parse(saved));
  }, []);

  const monthlySavings = userData.income - (userData.fixed + userData.variable);
  const annualSavings = monthlySavings * 12;
  const taxEstimate = userData.income * 0.25; // 25% becsült adó

  const chartData = [
    { name: 'Now', total: 0 },
    { name: 'Y1', total: monthlySavings * 12 * 1.08 },
    { name: 'Y3', total: monthlySavings * 36 * 1.25 },
    { name: 'Y5', total: monthlySavings * 60 * 1.45 },
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
    } catch (e) { setAiResponse("System calibration required."); }
    setLoading(false);
  };

  return (
    <div style={{ background: '#020617', color: '#f8fafc', minHeight: '100vh', padding: '40px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* TOP ANALYTICS BAR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
          <div style={ytsCard}>
            <p style={ytsLabel}>ESTIMATED NET WORTH (5Y)</p>
            <h2 style={ytsValue}>${(monthlySavings * 60 * 1.45).toLocaleString()}</h2>
            <p style={{ color: '#10b981', fontSize: '12px' }}>↑ 45% ROI included</p>
          </div>
          <div style={ytsCard}>
            <p style={ytsLabel}>SAVINGS EFFICIENCY</p>
            <h2 style={ytsValue}>{((monthlySavings / userData.income) * 100).toFixed(1)}%</h2>
            <p style={{ color: '#10b981', fontSize: '12px' }}>Optimal Range</p>
          </div>
          <div style={ytsCard}>
            <p style={ytsLabel}>EST. ANNUAL TAX</p>
            <h2 style={ytsValue}>${(taxEstimate * 12).toLocaleString()}</h2>
            <p style={{ color: '#f43f5e', fontSize: '12px' }}>Based on 25% bracket</p>
          </div>
          <div style={ytsCard}>
            <p style={ytsLabel}>WEALTH RANK</p>
            <h2 style={ytsValue}>#4,291</h2>
            <p style={{ color: '#3b82f6', fontSize: '12px' }}>Top 8% worldwide</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
          
          {/* MAIN GRAPH */}
          <div style={mainPanel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>Wealth Acceleration Chart</h3>
              <select style={selectStyle}><option>Compound Interest (8%)</option></select>
            </div>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
                  <Area type="monotone" dataKey="total" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI SECTION */}
          <div style={mainPanel}>
            <h3>🤖 WealthAI Advisor PRO</h3>
            <div style={{ margin: '20px 0' }}>
              {['income', 'fixed', 'variable'].map(key => (
                <div key={key} style={inputRow}>
                  <span>{key}</span>
                  <input 
                    type="number" 
                    value={userData[key]} 
                    onChange={(e) => {
                      const d = {...userData, [key]: Number(e.target.value)};
                      setUserData(d);
                      localStorage.setItem('userFinancials', JSON.stringify(d));
                    }}
                    style={miniInput}
                  />
                </div>
              ))}
            </div>
            <button onClick={askAI} style={aiButton} disabled={loading}>
              {loading ? "ANALYZING MARKET DATA..." : "REGENERATE PRO STRATEGY"}
            </button>
            <div style={aiBox}>{aiResponse || "Click the button to start your personalized AI audit."}</div>
          </div>

        </div>

        {/* BOTTOM ACTIONS */}
        <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
          <button style={secBtn}>📥 Download Tax Report</button>
          <button style={secBtn}>🎯 Connect Bank Account (Beta)</button>
          <button style={secBtn}>📊 Export to CSV</button>
        </div>
      </div>
    </div>
  );
}

// STYLES
const ytsCard = { background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' };
const ytsLabel = { color: '#64748b', fontSize: '11px', fontWeight: 'bold', margin: '0 0 8px 0' };
const ytsValue = { fontSize: '1.8rem', margin: 0, color: '#fff' };
const mainPanel = { background: '#0f172a', padding: '30px', borderRadius: '16px', border: '1px solid #1e293b' };
const inputRow = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e293b' };
const miniInput = { background: 'none', border: 'none', color: '#10b981', textAlign: 'right', fontWeight: 'bold', outline: 'none', width: '100px' };
const aiButton = { background: '#10b981', color: '#000', border: 'none', padding: '15px', borderRadius: '8px', fontWeight: 'bold', width: '100%', cursor: 'pointer' };
const aiBox = { marginTop: '20px', padding: '15px', background: '#020617', borderRadius: '10px', fontSize: '14px', lineHeight: '1.6', borderLeft: '4px solid #10b981', minHeight: '150px', whiteSpace: 'pre-line' };
const secBtn = { background: '#1e293b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' };
const selectStyle = { background: '#1e293b', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' };
