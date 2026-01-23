import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PremiumDashboard() {
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({ income: 5000, fixed: 2000, variable: 1500 });

  // ADATOK BEOLVASÁSA A BÖNGÉSZŐBŐL
  useEffect(() => {
    const savedData = localStorage.getItem('userFinancials');
    if (savedData) {
      setUserData(JSON.parse(savedData));
    }
  }, []);

  const monthlySavings = userData.income - (userData.fixed + userData.variable);
  const savingsRate = userData.income > 0 ? ((monthlySavings / userData.income) * 100) : 0;

  const chartData = [
    { name: 'Now', savings: 0 },
    { name: 'Y1', savings: monthlySavings * 12 },
    { name: 'Y2', savings: monthlySavings * 24 },
    { name: 'Y3', savings: monthlySavings * 36 },
    { name: 'Y4', savings: monthlySavings * 48 },
    { name: 'Y5', savings: monthlySavings * 60 },
  ];

  const askAI = async () => {
    setLoading(true);
    setAiResponse("");
    try {
      const response = await fetch('/api/get-ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      setAiResponse(data.insight);
    } catch (error) {
      setAiResponse("System update in progress. Please try again in a few minutes.");
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#060b13', color: 'white', minHeight: '100vh', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ color: '#00ff88', fontSize: '2.5rem' }}>WealthyAI Studio</h1>
          <p style={{ opacity: 0.8 }}>Advanced Financial Analytics</p>
        </header>

        {/* ANALYITCS SÁV - VALÓDI SZÁMOKKAL */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
          <div style={analyticsCard}>
            <p style={labelStyle}>Net Worth (5Y)</p>
            <h2 style={valueStyle}>${(monthlySavings * 60).toLocaleString()}</h2>
            <p style={{ color: '#00ff88', fontSize: '0.8rem' }}>↑ Projection</p>
          </div>
          <div style={analyticsCard}>
            <p style={labelStyle}>Savings Rate</p>
            <h2 style={valueStyle}>{savingsRate.toFixed(1)}%</h2>
            <p style={{ color: savingsRate > 20 ? '#00ff88' : '#ff4d4d', fontSize: '0.8rem' }}>
              {savingsRate > 20 ? 'Optimal' : 'Below Average'}
            </p>
          </div>
          <div style={analyticsCard}>
            <p style={labelStyle}>Financial Score</p>
            <h2 style={valueStyle}>{Math.min(Math.round(savingsRate * 2.5), 100)}/100</h2>
            <p style={{ color: '#00ff88', fontSize: '0.8rem' }}>Trust Score</p>
          </div>
          <div style={analyticsCard}>
            <p style={labelStyle}>Monthly Surplus</p>
            <h2 style={valueStyle}>${monthlySavings.toLocaleString()}</h2>
            <p style={{ color: '#aaa', fontSize: '0.8rem' }}>For Investing</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* AI TANÁCSADÓ */}
          <div style={cardStyle}>
            <h3 style={{ color: '#00ff88' }}>🤖 AI Financial Advisor</h3>
            <button onClick={askAI} style={buttonStyle} disabled={loading}>
              {loading ? "CONSULTING AI..." : "GET AI INSIGHTS"}
            </button>
            <div style={aiResultBox}>
              {aiResponse || "Click the button to receive your premium financial roadmap."}
            </div>
          </div>

          {/* GRAFIKON */}
          <div style={cardStyle}>
            <h3 style={{ color: '#00ff88' }}>📈 Wealth Projection</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ background: '#111', border: 'none' }} />
                  <Area type="monotone" dataKey="savings" stroke="#00ff88" fill="#00ff88" fillOpacity={0.1} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button style={miniCard} onClick={() => alert('Goal feature coming soon!')}>🎯 Set Goal</button>
          <button style={miniCard} onClick={() => window.print()}>📥 Print Report</button>
        </div>
      </div>
    </div>
  );
}

const cardStyle = { background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' };
const analyticsCard = { background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.08)' };
const labelStyle = { color: '#aaa', fontSize: '0.85rem', marginBottom: '5px' };
const valueStyle = { color: '#fff', fontSize: '1.8rem', margin: '0' };
const buttonStyle = { background: '#00ff88', color: '#060b13', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', width: '100%', cursor: 'pointer' };
const aiResultBox = { marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', minHeight: '120px', borderLeft: '4px solid #00ff88', whiteSpace: 'pre-line', fontSize: '0.95rem' };
const miniCard = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer' };
