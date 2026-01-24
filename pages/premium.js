import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/* =========================
   SAFE NUMBER HELPER
========================= */
const safeNum = (v) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

/* =========================
   PRO METRICS CARDS (A1)
========================= */
function ProMetricsCards({ income, fixed, variable }) {
  const safeIncome = safeNum(income);
  const safeFixed = safeNum(fixed);
  const safeVariable = safeNum(variable);

  const expenses = safeFixed + safeVariable;
  const surplus = safeIncome - expenses;
  const savingsRate =
    safeIncome > 0 ? (surplus / safeIncome) * 100 : 0;

  const projected5Y =
    surplus > 0 ? surplus * 60 * 1.45 : 0;

  const risk =
    savingsRate < 0 ? 'Critical'
    : savingsRate < 10 ? 'High'
    : savingsRate < 20 ? 'Medium'
    : 'Healthy';

  const riskColor =
    risk === 'Critical' ? '#ef4444'
    : risk === 'High' ? '#f97316'
    : risk === 'Medium' ? '#facc15'
    : '#10b981';

  const cards = [
    {
      label: 'Monthly Surplus',
      value: `$${surplus.toLocaleString()}`,
    },
    {
      label: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
    },
    {
      label: 'Risk Level',
      value: risk,
      color: riskColor,
    },
    {
      label: '5Y Projection',
      value: `$${projected5Y.toLocaleString()}`,
    },
  ];

  return (
    <div style={kpiGrid}>
      {cards.map((c, i) => (
        <div key={i} style={kpiCard}>
          <p style={kpiLabel}>{c.label}</p>
          <h2 style={{ ...kpiValue, color: c.color || '#fff' }}>
            {c.value}
          </h2>
        </div>
      ))}
    </div>
  );
}

/* =========================
   PREMIUM DASHBOARD
========================= */
export default function PremiumDashboard() {
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    income: 0,
    fixed: 0,
    variable: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem('userFinancials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserData({
          income: safeNum(parsed.income),
          fixed: safeNum(parsed.fixed),
          variable: safeNum(parsed.variable),
        });
      } catch {
        // fallback
        setUserData({ income: 0, fixed: 0, variable: 0 });
      }
    }
  }, []);

  const monthlySavings =
    userData.income - (userData.fixed + userData.variable);

  const chartData = [
    { name: 'Now', total: 0 },
    { name: 'Y1', total: Math.max(monthlySavings * 12 * 1.08, 0) },
    { name: 'Y3', total: Math.max(monthlySavings * 36 * 1.25, 0) },
    { name: 'Y5', total: Math.max(monthlySavings * 60 * 1.45, 0) },
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
    } catch {
      setAiResponse('System calibration required.');
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        background: '#020617',
        color: '#f8fafc',
        minHeight: '100vh',
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <ProMetricsCards
          income={userData.income}
          fixed={userData.fixed}
          variable={userData.variable}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: '30px',
          }}
        >
          <div style={panel}>
            <h3>Wealth Acceleration</h3>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                    vertical={false}
                  />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.12}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={panel}>
            <h3>🤖 WealthAI Advisor PRO</h3>

            {['income', 'fixed', 'variable'].map((key) => (
              <div key={key} style={inputRow}>
                <span>{key}</span>
                <input
                  type="number"
                  value={userData[key]}
                  onChange={(e) => {
                    const d = {
                      ...userData,
                      [key]: safeNum(e.target.value),
                    };
                    setUserData(d);
                    localStorage.setItem(
                      'userFinancials',
                      JSON.stringify(d)
                    );
                  }}
                  style={miniInput}
                />
              </div>
            ))}

            <button
              onClick={askAI}
              style={aiButton}
              disabled={loading}
            >
              {loading
                ? 'ANALYZING MARKET DATA...'
                : 'REGENERATE PRO STRATEGY'}
            </button>

            <div style={aiBox}>
              {aiResponse ||
                'Click the button to generate your personalized AI strategy.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   STYLES
========================= */
const kpiGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '20px',
  marginBottom: '40px',
};

const kpiCard = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '14px',
  padding: '20px',
};

const kpiLabel = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: 'bold',
  marginBottom: '6px',
};

const kpiValue = {
  fontSize: '1.9rem',
  margin: 0,
};

const panel = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '16px',
  padding: '30px',
};

const inputRow = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  borderBottom: '1px solid #1e293b',
};

const miniInput = {
  background: 'none',
  border: 'none',
  color: '#10b981',
  textAlign: 'right',
  fontWeight: 'bold',
  outline: 'none',
  width: '100px',
};

const aiButton = {
  background: '#10b981',
  color: '#000',
  border: 'none',
  padding: '14px',
  borderRadius: '8px',
  fontWeight: 'bold',
  width: '100%',
  cursor: 'pointer',
  marginTop: '20px',
};

const aiBox = {
  marginTop: '20px',
  padding: '15px',
  background: '#020617',
  borderRadius: '10px',
  fontSize: '14px',
  lineHeight: '1.6',
  borderLeft: '4px solid #10b981',
  minHeight: '140px',
  whiteSpace: 'pre-line',
};
