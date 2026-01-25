import { useState, useEffect } from "react";
import {
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts";

/* ===== CONSTANTS ===== */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CATEGORIES = ["rent", "food", "transport", "entertainment", "subscriptions", "other"];

const COLORS = {
  rent: "#00e5ff",
  food: "#00ffd5",
  transport: "#00ff88",
  entertainment: "#a78bfa",
  subscriptions: "#ff6ec7",
  other: "#ffe066",
};

/* ===== MAIN ===== */

export default function PremiumWeek() {
  const [incomeValue, setIncomeValue] = useState(3000);
  const [week, setWeek] = useState(
    DAYS.reduce((a, d) => {
      a[d] = CATEGORIES.reduce((o, c) => ({ ...o, [c]: 0 }), {});
      return a;
    }, {})
  );

  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (day, cat, val) => {
    setWeek({ ...week, [day]: { ...week[day], [cat]: Number(val) } });
  };

  const dailyTotals = DAYS.map(d =>
    Object.values(week[d]).reduce((a, b) => a + b, 0)
  );

  const weeklySpend = dailyTotals.reduce((a, b) => a + b, 0);

  const chartData = DAYS.map((d, i) => ({
    day: d,
    total: dailyTotals[i],
    ...week[d],
  }));

  const pieData = CATEGORIES.map(c => ({
    name: c,
    value: DAYS.reduce((s, d) => s + week[d][c], 0),
  }));

  const scatterData = DAYS.map((d, i) => ({
    x: i + 1,
    y: dailyTotals[i],
  }));

  const runAI = () => {
    setLoading(true);
    setTimeout(() => {
      setAiText(
        `AI SIGNAL:\n• Spending momentum is ${weeklySpend > incomeValue ? "NEGATIVE" : "STABLE"}\n• Highest pressure detected mid-week\n• Tactical advice: reduce variable categories by 5–8%`
      );
      setLoading(false);
    }, 900);
  };

  return (
    <div style={page}>
      <div style={container}>

        {/* HEADER */}
        <header style={header}>
          <div>
            <h1 style={title}>WEALTHYAI</h1>
            <div style={subtitle}>WEEKLY FINANCIAL INTELLIGENCE</div>
          </div>
          <div style={chip}>PRO</div>
        </header>

        {/* KPI */}
        <section style={kpiGrid}>
          <KPI label="Weekly Spend" value={`$${weeklySpend}`} />
          <KPI label="Income" value={`$${incomeValue}`} />
          <KPI label="Balance" value={`$${incomeValue - weeklySpend}`} />
        </section>

        {/* DASHBOARD */}
        <main style={grid}>

          {/* INPUT */}
          <Panel title="INPUT MATRIX">
            <input
              type="number"
              value={incomeValue}
              onChange={e => setIncomeValue(Number(e.target.value))}
              style={input}
              placeholder="Weekly income"
            />

            {DAYS.map(d => (
              <div key={d} style={dayRow}>
                <div style={day}>{d}</div>
                {CATEGORIES.map(c => (
                  <input
                    key={c}
                    type="number"
                    value={week[d][c]}
                    onChange={e => update(d, c, e.target.value)}
                    placeholder={c}
                    style={miniInput}
                  />
                ))}
              </div>
            ))}
          </Panel>

          {/* CHARTS */}
          <Panel title="SIGNALS">
            <Chart title="Cash Flow">
              <AreaChart data={chartData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area dataKey="total" stroke="#00e5ff" fill="#00e5ff" fillOpacity={0.2} />
              </AreaChart>
            </Chart>

            <Chart title="Distribution">
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={90}>
                  {pieData.map((p, i) => (
                    <Cell key={i} fill={COLORS[p.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </Chart>

            <Chart title="Dispersion">
              <ScatterChart>
                <XAxis />
                <YAxis />
                <Tooltip />
                <Scatter data={scatterData} fill="#a78bfa" />
              </ScatterChart>
            </Chart>
          </Panel>
        </main>

        {/* AI */}
        <section style={aiPanel}>
          <button onClick={runAI} style={aiButton}>
            {loading ? "ANALYZING…" : "REGENERATE AI STRATEGY"}
          </button>
          <pre style={aiTextStyle}>{aiText}</pre>
        </section>

      </div>
    </div>
  );
}

/* ===== UI COMPONENTS ===== */

const KPI = ({ label, value }) => (
  <div style={kpi}>
    <div style={kpiLabel}>{label}</div>
    <div style={kpiValue}>{value}</div>
  </div>
);

const Panel = ({ title, children }) => (
  <section style={panel}>
    <div style={panelTitle}>{title}</div>
    {children}
  </section>
);

const Chart = ({ title, children }) => (
  <div style={chartBox}>
    <div style={chartTitle}>{title}</div>
    <ResponsiveContainer width="100%" height={220}>
      {children}
    </ResponsiveContainer>
  </div>
);

/* ===== STYLES ===== */

const page = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #020617, #000)",
  color: "#e5e7eb",
};

const container = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: 20,
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
};

const title = { fontSize: 28, letterSpacing: 2 };
const subtitle = { fontSize: 12, color: "#00e5ff" };
const chip = { background: "#00e5ff", color: "#000", padding: "6px 12px", borderRadius: 999 };

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))",
  gap: 12,
  marginBottom: 20,
};

const kpi = {
  border: "1px solid #0f172a",
  borderRadius: 14,
  padding: 14,
  background: "rgba(2,6,23,0.8)",
};

const kpiLabel = { fontSize: 11, color: "#00e5ff" };
const kpiValue = { fontSize: 22, fontWeight: "bold" };

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px,1fr))",
  gap: 16,
};

const panel = {
  border: "1px solid #0f172a",
  borderRadius: 18,
  padding: 16,
  background: "rgba(2,6,23,0.85)",
};

const panelTitle = {
  color: "#00e5ff",
  fontSize: 12,
  marginBottom: 12,
  letterSpacing: 1,
};

const dayRow = {
  display: "grid",
  gridTemplateColumns: "60px repeat(6,1fr)",
  gap: 6,
  marginBottom: 6,
};

const day = { fontSize: 11, color: "#7dd3fc" };

const input = {
  width: "100%",
  padding: 10,
  background: "#020617",
  border: "1px solid #0f172a",
  color: "#00e5ff",
  marginBottom: 12,
};

const miniInput = {
  ...input,
  padding: 6,
  fontSize: 11,
};

const chartBox = {
  border: "1px solid #0f172a",
  borderRadius: 14,
  padding: 10,
  marginBottom: 12,
};

const chartTitle = { fontSize: 11, color: "#7dd3fc", marginBottom: 6 };

const aiPanel = {
  marginTop: 20,
  border: "1px solid #00e5ff",
  borderRadius: 18,
  padding: 16,
  background: "rgba(0,229,255,0.05)",
};

const aiButton = {
  width: "100%",
  padding: 14,
  background: "#00e5ff",
  border: "none",
  borderRadius: 14,
  fontWeight: "bold",
  cursor: "pointer",
};

const aiTextStyle = {
  marginTop: 12,
  whiteSpace: "pre-wrap",
  fontSize: 12,
  color: "#cbd5f5",
};
