import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line
} from 'recharts';

export default function PremiumDashboard() {
  const [tier, setTier] = useState(null);
  const [data, setData] = useState({ income: 5000, fixed: 2000, variable: 1500 });
  const [aiText, setAiText] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const access = JSON.parse(localStorage.getItem('premiumAccess'));
    if (!access || Date.now() > access.expiresAt) return;
    setTier(access.tier);

    const saved = localStorage.getItem('userFinancials');
    if (saved) setData(JSON.parse(saved));
  }, []);

  if (!tier) {
    return <div style={center}>Loading premium…</div>;
  }

  // CALCS
  const total = data.fixed + data.variable;
  const surplus = data.income - total;
  const savingsRate = data.income > 0 ? (surplus / data.income) * 100 : 0;
  const risk =
    savingsRate < 5 ? 'High' :
    savingsRate < 15 ? 'Medium' : 'Low';

  const projection = [
    { name: 'Now', total: 0 },
    { name: 'Y1', total: surplus * 12 * 1.08 },
    { name: 'Y3', total: surplus * 36 * 1.25 },
    { name: 'Y5', total: surplus * 60 * 1.45 },
  ];

  const expenseData = [
    { name: 'Fixed', value: data.fixed },
    { name: 'Variable', value: data.variable },
  ];

  const allocation = [
    { name: 'Expenses', value: total },
    { name: 'Savings', value: surplus },
  ];

  const riskData = [
    { name: 'Stability', value: savingsRate },
  ];

  const askAI = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch('/api/get-ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      setAiText(d.insight);
    } catch {
      setAiText(
        `• Surplus: $${surplus}\n• Advice: Aim for stable 20% savings.\n• Status: AI temporarily unavailable.`
      );
    }
    setLoadingAI(false);
  };

  return (
    <main style={page}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* WELCOME */}
        <div style={panel}>
          <h1>🎉 Welcome to WealthyAI – 1 Day Pro Access</h1>
          <p>
            You now have access to advanced analytics, multi-angle projections
            and AI-powered financial strategy tools.
          </p>
        </div>

        {/* INPUTS */}
        <div style={panel}>
          {['income','fixed','variable'].map(k => (
            <div key={k} style={inputRow}>
              <span>{k.toUpperCase()}</span>
              <input
                type="number"
                value={data[k]}
                onChange={e => {
                  const d = { ...data, [k]: Number(e.target.value) };
                  setData(d);
                  localStorage.setItem('userFinancials', JSON.stringify(d));
                }}
                style={miniInput}
              />
            </div>
          ))}
        </div>

        {/* KPI */}
        <div style={kpiGrid}>
          <KPI title="Monthly Surplus" value={`$${surplus}`} />
          <KPI title="Savings Rate" value={`${savingsRate.toFixed(1)}%`} />
          <KPI title="Risk Level" value={risk} />
          <KPI title="5Y Projection" value={`$${(surplus*60*1.45).toFixed(0)}`} />
        </div>

        {/* CHART GRID */}
        <div style={chartGrid}>
          <ChartBox title="Wealth Growth">
            <AreaChart data={projection}>
              <Area dataKey="total" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} />
            </AreaChart>
          </ChartBox>

          <ChartBox title="Expense Split">
            <PieChart>
              <Pie data={expenseData} dataKey="value" outerRadius={80}>
                {expenseData.map((_, i) => (
                  <Cell key={i} fill={['#f43f5e','#3b82f6'][i]} />
                ))}
              </Pie>
            </PieChart>
          </ChartBox>

          <ChartBox title="Monthly Allocation">
            <BarChart data={allocation}>
              <Bar dataKey="value" fill="#22c55e" />
            </BarChart>
          </ChartBox>

          <ChartBox title="Stability Index">
            <LineChart data={riskData}>
              <Line dataKey="value" stroke="#eab308" />
            </LineChart>
          </ChartBox>
        </div>

        {/* AI */}
        <div style={panel}>
          <button onClick={askAI} style={aiBtn}>
            {loadingAI ? 'Analyzing…' : '🤖 Generate AI Strategy'}
          </button>
          <div style={aiBox}>{aiText}</div>
        </div>

        <div style={upsell}>
          🔒 Country-specific tax optimization and advanced simulations
          are available in Weekly and Monthly plans.
        </div>

      </div>
    </main>
  );
}

/* UI PARTS */
const KPI = ({ title, value }) => (
  <div style={kpiCard}>
    <small>{title}</small>
    <h2>{value}</h2>
  </div>
);

const ChartBox = ({ title, children }) => (
  <div style={chartBox}>
    <h4>{title}</h4>
    <ResponsiveContainer width="100%" height={200}>
      {children}
    </ResponsiveContainer>
  </div>
);

/* STYLES */
const page = { background:'#020617', color:'#fff', minHeight:'100vh', padding:'40px' };
const center = { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh' };
const panel = { background:'#0f172a', padding:25, borderRadius:16, marginBottom:25 };
const kpiGrid = { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:20 };
const kpiCard = { background:'#020617', padding:20, borderRadius:12 };
const chartGrid = { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20 };
const chartBox = { background:'#0f172a', padding:20, borderRadius:16 };
const inputRow = { display:'flex', justifyContent:'space-between', marginBottom:10 };
const miniInput = { background:'none', border:'none', color:'#22c55e', fontSize:'16px', textAlign:'right', width:120 };
const aiBtn = { background:'#22c55e', padding:15, border:'none', borderRadius:8, width:'100%', fontWeight:'bold' };
const aiBox = { marginTop:15, padding:15, background:'#020617', minHeight:120, whiteSpace:'pre-line' };
const upsell = { marginTop:30, textAlign:'center', opacity:0.7 };
