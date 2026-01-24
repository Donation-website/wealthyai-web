import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

export default function PremiumDashboard() {
  const [tier, setTier] = useState('day');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    income: 5000,
    fixed: 2000,
    variable: 1500,
    country: 'US'
  });

  useEffect(() => {
    const saved = localStorage.getItem('userFinancials');
    const t = localStorage.getItem('premiumTier');
    if (saved) setUserData(JSON.parse(saved));
    if (t) setTier(t);
  }, []);

  const monthlySavings = userData.income - (userData.fixed + userData.variable);
  const annualSavings = monthlySavings * 12;

  /* =========================
     CHART DATA (TIER BASED)
  ========================= */
  const growthData = [
    { name: 'Now', value: 0 },
    { name: '1Y', value: annualSavings * 1.08 },
    { name: '3Y', value: annualSavings * 3 * 1.25 },
    { name: '5Y', value: annualSavings * 5 * 1.45 },
  ];

  const expenseBreakdown = [
    { name: 'Fixed', value: userData.fixed },
    { name: 'Variable', value: userData.variable },
    { name: 'Savings', value: monthlySavings },
  ];

  /* =========================
     AI CALL (DEPTH BY TIER)
  ========================= */
  const askAI = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/get-ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData,
          tier
        }),
      });
      const data = await res.json();
      setAiResponse(data.insight);
    } catch {
      setAiResponse('AI system temporarily unavailable.');
    }
    setLoading(false);
  };

  /* =========================
     UI HELPERS
  ========================= */
  const tierLabel = {
    day: '1 Day Pass',
    week: '1 Week Pass',
    month: 'PRO Monthly'
  };

  return (
    <main style={page}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={header}>
          <h1>WealthAI Premium</h1>
          <span style={badge}>{tierLabel[tier]}</span>
        </div>

        {/* SUMMARY BAR */}
        <div style={summaryGrid}>
          <SummaryCard title="Monthly Savings" value={`$${monthlySavings}`} />
          <SummaryCard title="Annual Projection" value={`$${annualSavings}`} />
          <SummaryCard title="Savings Rate" value={`${((monthlySavings / userData.income) * 100).toFixed(1)}%`} />
          {tier === 'month' && (
            <SummaryCard title="Est. Tax Impact" value={`-${Math.round(userData.income * 0.22)}$`} />
          )}
        </div>

        {/* MAIN CONTENT */}
        <div style={mainGrid}>

          {/* LEFT – CHARTS */}
          <div style={panel}>
            <h3>📈 Wealth Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={growthData}>
                <CartesianGrid stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>

            {tier !== 'day' && (
              <>
                <h3 style={{ marginTop: 30 }}>📊 Expense Breakdown</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={expenseBreakdown}>
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>

          {/* RIGHT – AI */}
          <div style={panel}>
            <h3>🤖 WealthAI Advisor</h3>

            {['income','fixed','variable'].map(k => (
              <div key={k} style={row}>
                <span>{k}</span>
                <input
                  type="number"
                  value={userData[k]}
                  onChange={e => {
                    const d = { ...userData, [k]: Number(e.target.value) };
                    setUserData(d);
                    localStorage.setItem('userFinancials', JSON.stringify(d));
                  }}
                  style={input}
                />
              </div>
            ))}

            {tier === 'month' && (
              <div style={row}>
                <span>Country</span>
                <select
                  value={userData.country}
                  onChange={e => setUserData({ ...userData, country: e.target.value })}
                  style={input}
                >
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="EU">European Union</option>
                </select>
              </div>
            )}

            <button onClick={askAI} style={button} disabled={loading}>
              {loading ? 'Analyzing…' : 'Generate Strategy'}
            </button>

            <div style={aiBox}>
              {aiResponse || 'Run the AI to receive your personalized strategy.'}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

/* =========================
   COMPONENTS & STYLES
========================= */

const SummaryCard = ({ title, value }) => (
  <div style={summaryCard}>
    <p style={summaryLabel}>{title}</p>
    <h2>{value}</h2>
  </div>
);

const page = {
  minHeight: '100vh',
  background: '#020617',
  color: '#f8fafc',
  padding: '40px',
  fontFamily: 'Arial, sans-serif'
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 30
};

const badge = {
  background: '#10b981',
  color: '#000',
  padding: '6px 12px',
  borderRadius: 20,
  fontWeight: 'bold',
  fontSize: 12
};

const summaryGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
  gap: 20,
  marginBottom: 40
};

const summaryCard = {
  background: '#0f172a',
  borderRadius: 14,
  padding: 20,
  border: '1px solid #1e293b'
};

const summaryLabel = {
  color: '#94a3b8',
  fontSize: 12,
  marginBottom: 6
};

const mainGrid = {
  display: 'grid',
  gridTemplateColumns: '1.6fr 1fr',
  gap: 30
};

const panel = {
  background: '#0f172a',
  borderRadius: 16,
  padding: 30,
  border: '1px solid #1e293b'
};

const row = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10
};

const input = {
  background: '#020617',
  border: '1px solid #1e293b',
  color: '#10b981',
  padding: '6px 10px',
  borderRadius: 6,
  width: 120
};

const button = {
  marginTop: 15,
  width: '100%',
  padding: 14,
  borderRadius: 10,
  border: 'none',
  background: '#10b981',
  color: '#000',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const aiBox = {
  marginTop: 20,
  padding: 15,
  background: '#020617',
  borderRadius: 10,
  borderLeft: '4px solid #10b981',
  minHeight: 160,
  whiteSpace: 'pre-line',
  fontSize: 14
};
