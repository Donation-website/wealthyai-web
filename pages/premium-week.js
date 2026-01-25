import { useState } from "react";
import {
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts";

/* ================= CONSTANTS ================= */

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const CATEGORIES = ["rent","food","transport","entertainment","subscriptions","other"];

const COLORS = {
  rent: "#38bdf8",
  food: "#22d3ee",
  transport: "#34d399",
  entertainment: "#a78bfa",
  subscriptions: "#f472b6",
  other: "#facc15",
};

/* ================= PAGE ================= */

export default function PremiumWeek() {
  const [income, setIncome] = useState(750);
  const [week, setWeek] = useState(
    DAYS.reduce((a,d)=>({
      ...a,
      [d]: CATEGORIES.reduce((o,c)=>({...o,[c]:0}),{})
    }),{})
  );

  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  /* ===== CALCULATIONS ===== */

  const dailyTotals = DAYS.map(d =>
    Object.values(week[d]).reduce((a,b)=>a+b,0)
  );

  const weeklySpend = dailyTotals.reduce((a,b)=>a+b,0);
  const savingsRate = income > 0 ? ((income-weeklySpend)/income)*100 : 0;

  const chartData = DAYS.map((d,i)=>({
    day:d,
    total: dailyTotals[i],
    ...week[d],
  }));

  const pieData = CATEGORIES.map(c=>({
    name:c,
    value:DAYS.reduce((s,d)=>s+week[d][c],0),
  }));

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        savingsRate * 2 -
        (Math.max(...dailyTotals)/(weeklySpend+1))*40
      )
    )
  );

  /* ===== AI ===== */

  const runAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/get-ai-insight",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          country:"US",
          weeklyIncome:income,
          weeklySpend,
          dailyTotals,
          breakdown:week,
        }),
      });
      const json = await res.json();
      setAiText(json.insight || "AI unavailable.");
    } catch {
      setAiText("AI system error.");
    }
    setLoading(false);
  };

  /* ================= RENDER ================= */

  return (
    <div style={page}>

      {/* HEADER */}
      <div style={header}>
        <h1 style={title}>Weekly AI Command Center</h1>
        <p style={subtitle}>
          Behavioral analysis · Risk detection · Tactical optimization
        </p>
      </div>

      {/* KPI GRID */}
      <div style={kpiGrid}>
        <KPI title="Weekly Spend" value={`$${weeklySpend}`} />
        <KPI title="Savings Rate" value={`${savingsRate.toFixed(1)}%`} />
        <KPI title="Risk Level" value={savingsRate > 20 ? "Low" : "Medium"} />
        <KPI title="Financial Score" value={`${score} / 100`} />
      </div>

      {/* CHARTS */}
      <div style={chartGrid}>
        <Panel title="Cash Flow Over Time">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area dataKey="total" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.25} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Spending Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={80}>
                {pieData.map((p,i)=>(
                  <Cell key={i} fill={COLORS[p.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Savings Velocity">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line dataKey="total" stroke="#a78bfa" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* INPUTS */}
      <div style={inputGrid}>
        {DAYS.map(d=>(
          <div key={d} style={dayBox}>
            <div style={dayTitle}>{d}</div>
            {CATEGORIES.map(c=>(
              <input
                key={c}
                type="number"
                placeholder={c}
                value={week[d][c]}
                onChange={e=>setWeek({
                  ...week,
                  [d]:{...week[d],[c]:Number(e.target.value)}
                })}
                style={input}
              />
            ))}
          </div>
        ))}
      </div>

      {/* AI */}
      <div style={aiBox}>
        <button onClick={runAI} style={aiButton}>
          {loading ? "Analyzing…" : "Regenerate AI Strategy"}
        </button>
        <pre style={aiTextStyle}>
          {aiText || "AI will analyze your weekly behavior and provide strategic guidance."}
        </pre>
      </div>

    </div>
  );
}

/* ================= COMPONENTS ================= */

function KPI({ title, value }) {
  return (
    <div style={kpi}>
      <div style={kpiTitle}>{title}</div>
      <div style={kpiValue}>{value}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={panel}>
      <div style={panelTitle}>{title}</div>
      {children}
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  minHeight:"100vh",
  background:"radial-gradient(circle at top, #020617, #000)",
  color:"#e5e7eb",
  padding:"24px",
  fontFamily:"Inter, system-ui",
};

const header = { marginBottom:32 };
const title = { fontSize:32, fontWeight:"bold", color:"#38bdf8" };
const subtitle = { color:"#94a3b8", marginTop:8 };

const kpiGrid = {
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",
  gap:16,
  marginBottom:32,
};

const chartGrid = {
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",
  gap:16,
  marginBottom:32,
};

const inputGrid = {
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",
  gap:12,
  marginBottom:32,
};

const kpi = {
  background:"rgba(15,23,42,0.7)",
  border:"1px solid #1e293b",
  borderRadius:14,
  padding:16,
};

const kpiTitle = { fontSize:12, color:"#94a3b8" };
const kpiValue = { fontSize:22, fontWeight:"bold", color:"#38bdf8" };

const panel = {
  background:"rgba(15,23,42,0.7)",
  border:"1px solid #1e293b",
  borderRadius:14,
  padding:16,
};

const panelTitle = { fontSize:13, color:"#7dd3fc", marginBottom:8 };

const dayBox = {
  background:"rgba(15,23,42,0.7)",
  border:"1px solid #1e293b",
  borderRadius:12,
  padding:12,
};

const dayTitle = { color:"#38bdf8", marginBottom:8 };

const input = {
  width:"100%",
  marginBottom:6,
  background:"transparent",
  border:"none",
  borderBottom:"1px solid #38bdf8",
  color:"#38bdf8",
  outline:"none",
};

const aiBox = {
  background:"rgba(15,23,42,0.7)",
  border:"1px solid #1e293b",
  borderRadius:16,
  padding:20,
};

const aiButton = {
  width:"100%",
  padding:14,
  background:"#38bdf8",
  color:"#000",
  fontWeight:"bold",
  border:"none",
  borderRadius:10,
  cursor:"pointer",
};

const aiTextStyle = {
  marginTop:12,
  whiteSpace:"pre-wrap",
  color:"#cbd5f5",
};
