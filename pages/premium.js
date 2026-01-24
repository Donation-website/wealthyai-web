import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function PremiumDashboard() {
  const [tier, setTier] = useState(null);
  const [userData, setUserData] = useState(null);
  const [aiText, setAiText] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    // PREMIUM ACCESS
    const access = JSON.parse(localStorage.getItem('premiumAccess'));
    if (!access || Date.now() > access.expiresAt) return;

    setTier(access.tier);

    // USER DATA
    const saved = localStorage.getItem('userFinancials');
    if (saved) setUserData(JSON.parse(saved));
  }, []);

  if (!tier || !userData) {
    return (
      <div style={center}>
        <p>Loading your Premium workspace…</p>
      </div>
    );
  }

  // BASIC CALCS
  const totalExpenses = userData.fixed + userData.variable;
  const surplus = userData.income - totalExpenses;
  const savingsRate = (surplus / userData.income) * 100;

  const riskLevel =
    savingsRate < 5 ? "High"
    : savingsRate < 15 ? "Medium"
    : "Low";

  // PROJECTION
  const chartData = [
    { name: 'Now', total: 0 },
    { name: 'Y1', total: surplus * 12 * 1.08 },
    { name: 'Y3', total: surplus * 36 * 1.25 },
    { name: 'Y5', total: surplus * 60 * 1.45 },
  ];

  const opportunityCost = Math.max(0, (surplus * 60 * 1.45) - (surplus * 60));

  // AI CALL
  const askAI = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch('/api/get-ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      setAiText(data.insight);
    } catch {
      setAiText("AI analysis temporarily unavailable.");
    }
    setLoadingAI(false);
  };

  return (
    <main style={page}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* WELCOME */}
        <div style={welcomeBox}>
          <h1>🎉 Welcome to WealthyAI – 1 Day Pro Access</h1>
          <p>
            Thank you for choosing WealthyAI.
            You now have access to advanced financial analytics,
            AI-driven insights and professional projections.
          </p>
        </div>

        {/* KPI CARDS */}
        <div style={kpiGrid}>
          <KPI title="Monthly Surplus" value={`$${surplus.toLocaleString()}`} />
          <KPI title="Savings Rate" value={`${savingsRate.toFixed(1)}%`} />
          <KPI title="Risk Level" value={riskLevel} />
          <KPI title="5Y Opportunity Cost" value={`$${opportunityCost.toLocaleString()}`} />
        </div>

        {/* MAIN GRID */}
        <div style={grid}>

          {/* CHART */}
          <div style={panel}>
            <h3>Wealth Acceleration Projection</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#020617', border: '1px solid #1e293b' }} />
                  <Area type="monotone" dataKey="total" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PRO INSIGHTS */}
          <div style={panel}>
            <h3>📊 Pro Breakdown</h3>

            <ul>
              <li>Spending efficiency: <strong>{(totalExpenses / userData.income * 100).toFixed(1)}%</strong></li>
              <li>Optimal savings target: <strong>20%</strong></li>
              <li>Savings gap: <strong>${Math.max(0, (0.2 * userData.income) - surplus).toFixed(0)}/month</strong></li>
              <li>Risk exposure: <strong>{riskLevel}</strong></li>
            </ul>

            <div style={warningBox}>
              <strong>If nothing changes:</strong>
              <p>
                Over 5 years, you may lose approximately
                <strong> ${opportunityCost.toLocaleString()}</strong>
                in unrealized growth.
              </p>
            </div>

            <button onClick={askAI} style={aiBtn} disabled={loadingAI}>
              {loadingAI ? "Analyzing…" : "🤖 Generate AI Strategy"}
            </button>

            <div style={aiBox}>
              {aiText || "Run AI analysis to receive personalized strategy."}
            </div>
          </div>
        </div>

        {/* UPSELL */}
        <div style={upsell}>
          🔒 Country-specific tax optimization, provider comparison and stress-testing
          are available in Weekly and Monthly plans.
        </div>

      </div>
    </main>
  );
}

/* COMPONENTS */
const KPI = ({ title, value }) => (
  <div style={kpiCard}>
    <p style={kpiLabel}>{title}</p>
    <h2>{value}</h2>
  </div>
);

/* STYLES */
const page = {
  minHeight: '100vh',
  background: '#020617',
  color: '#f8fafc',
  padding: '40px',
  fontFamily: 'Arial, sans-serif'
};

const center = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  color: 'white'
};

const welcomeBox = {
  marginBottom: 40,
  padding: 25,
  background: '#0f172a',
  borderRadius: 16,
  border: '1px solid #1e293b'
};

const kpiGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 20,
  marginBottom: 40
};

const kpiCard = {
  background: '#0f172a',
  padding: 20,
  borderRadius: 14,
  border: '1px solid #1e293b'
};

const kpiLabel = {
  color: '#94a3b8',
  fontSize: 12,
  marginBottom: 6
};

const grid = {
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr',
  gap: 30
};

const panel = {
  background: '#0f172a',
  padding: 30,
  borderRadius: 16,
  border: '1px solid #1e293b'
};

const warningBox = {
  marginTop: 20,
  padding: 15,
  background: '#020617',
  borderLeft: '4px solid #f43f5e'
};

const aiBtn = {
  marginTop: 20,
  width: '100%',
  padding: 14,
  background: '#22c55e',
  border: 'none',
  borderRadius: 8,
  fontWeight: 'bold',
  cursor: 'pointer'
};

const aiBox = {
  marginTop: 20,
  padding: 15,
  background: '#020617',
  borderRadius: 10,
  minHeight: 140,
  whiteSpace: 'pre-line',
  borderLeft: '4px solid #22c55e'
};

const upsell = {
  marginTop: 40,
  padding: 20,
  textAlign: 'center',
  opacity: 0.75
};
