import { useState, useEffect } from "react";
import {
  LineChart, Line,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";

/* ===== CONSTANTS ===== */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CATEGORIES = ["rent", "food", "transport", "entertainment", "subscriptions", "other"];

const COLORS = {
  rent: "#38bdf8",
  food: "#22d3ee",
  transport: "#34d399",
  entertainment: "#a78bfa",
  subscriptions: "#f472b6",
  other: "#facc15",
};

const COUNTRY_NAMES = {
  US: "United States",
  DE: "Germany",
  UK: "United Kingdom",
  HU: "Hungary",
};

/* ===== MAIN ===== */

export default function PremiumWeek() {
  /* COUNTRY */
  const [country, setCountry] = useState("auto");

  useEffect(() => {
    if (country === "auto") {
      const locale = navigator.language || "en-US";
      if (locale.includes("de")) setCountry("DE");
      else if (locale.includes("hu")) setCountry("HU");
      else if (locale.includes("en-GB")) setCountry("UK");
      else setCountry("US");
    }
  }, []);

  /* INCOME */
  const [incomeType, setIncomeType] = useState("monthly");
  const [incomeValue, setIncomeValue] = useState(3000);

  /* WEEKLY DATA */
  const [week, setWeek] = useState(
    DAYS.reduce((acc, d) => {
      acc[d] = CATEGORIES.reduce((o, c) => ({ ...o, [c]: 0 }), {});
      return acc;
    }, {})
  );

  /* AI */
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  /* HELPERS */

  const weeklyIncome =
    incomeType === "daily"
      ? incomeValue * 7
      : incomeType === "weekly"
      ? incomeValue
      : incomeValue / 4;

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
    day: d,
  }));

  /* AI CALL */

  const runAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "weekly",
          country,
          weeklyIncome,
          weeklySpend,
          dailyTotals,
          breakdown: week,
        }),
      });
      const data = await res.json();
      setAiText(data.insight || "AI analysis unavailable.");
    } catch {
      setAiText("AI system temporarily unavailable.");
    }
    setLoading(false);
  };

  /* ===== RENDER ===== */

  return (
    <div style={page}>

      {/* HEADER */}
      <div style={topBar}>
        <div>
          <h1 style={title}>WealthyAI · Weekly Intelligence</h1>
          <p style={subtitle}>AI-driven behavioral finance dashboard</p>
        </div>
        <button style={proBadge}>PRO ACCESS</button>
      </div>

      {/* KPIs */}
      <div style={kpiGrid}>
        <KPI label="Weekly Income" value={`$${weeklyIncome.toFixed(0)}`} />
        <KPI label="Weekly Spend" value={`$${weeklySpend}`} />
        <KPI label="Savings Rate" value={`${((1 - weeklySpend / weeklyIncome) * 100 || 0).toFixed(1)}%`} />
        <KPI label="Risk Level" value={weeklySpend > weeklyIncome ? "High" : "Low"} />
      </div>

      <div style={dashboard}>

        {/* LEFT – INPUT */}
        <div style={panel}>
          <PanelTitle>Weekly Input Matrix</PanelTitle>

          <div style={controlRow}>
            <select value={country} onChange={e => setCountry(e.target.value)} style={select}>
              {Object.entries(COUNTRY_NAMES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            <select value={incomeType} onChange={e => setIncomeType(e.target.value)} style={select}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            <input
              type="number"
              value={incomeValue}
              onChange={e => setIncomeValue(Number(e.target.value))}
              style={input}
            />
          </div>

          {DAYS.map(d => (
            <div key={d} style={dayRow}>
              <div style={dayLabel}>{d}</div>
              {CATEGORIES.map(c => (
                <input
                  key={c}
                  type="number"
                  placeholder={c}
                  value={week[d][c]}
                  onChange={e => update(d, c, e.target.value)}
                  style={miniInput}
                />
              ))}
            </div>
          ))}
        </div>

        {/* RIGHT – VISUALS */}
        <div style={panelWide}>
          <PanelTitle>Financial Signals</PanelTitle>

          <div style={chartGrid}>
            <Chart title="Cash Flow">
              <AreaChart data={chartData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area dataKey="total" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.25} />
              </AreaChart>
            </Chart>

            <Chart title="Category Trends">
              <LineChart data={chartData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                {CATEGORIES.map(c => (
                  <Line key={c} dataKey={c} stroke={COLORS[c]} dot={false} />
                ))}
              </LineChart>
            </Chart>

            <Chart title="Weekly Distribution">
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={90}>
                  {pieData.map((p, i) => (
                    <Cell key={i} fill={COLORS[p.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </Chart>

            <Chart title="Spending Dispersion">
              <ScatterChart>
                <XAxis dataKey="x" />
                <YAxis dataKey="y" />
                <Tooltip />
                <Scatter data={scatterData} fill="#a78bfa" />
              </ScatterChart>
            </Chart>
          </div>

          {/* AI */}
          <div style={aiPanel}>
            <button onClick={runAI} style={aiButton}>
              {loading ? "Analyzing…" : "Regenerate AI Strategy"}
            </button>
            <pre style={aiTextStyle}>
              {aiText || "AI will generate tactical weekly insights based on your behavior."}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ===== COMPONENTS ===== */

function KPI({ label, value }) {
  return (
    <div style={kpi}>
      <div style={kpiLabel}>{label}</div>
      <div style={kpiValue}>{value}</div>
    </div>
  );
}

function Chart({ title, children }) {
  return (
    <div style={chartBox}>
      <div style={chartTitle}>{title}</div>
      <ResponsiveContainer width="100%" height={220}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function PanelTitle({ children }) {
  return <div style={panelTitle}>{children}</div>;
}

/* ===== STYLES ===== */

const page = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #020617, #000)",
  color: "#e5e7eb",
  padding: 40,
  fontFamily: "Inter, system-ui",
};

const topBar = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 };
const title = { fontSize: "2.4rem" };
const subtitle = { color: "#7dd3fc" };
const proBadge = { background: "#38bdf8", color: "#000", borderRadius: 999, padding: "8px 16px", fontWeight: "bold" };

const kpiGrid = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 30 };
const kpi = { border: "1px solid #1e293b", borderRadius: 14, padding: 16, background: "rgba(2,6,23,0.6)" };
const kpiLabel = { fontSize: 12, color: "#7dd3fc" };
const kpiValue = { fontSize: 24, fontWeight: "bold" };

const dashboard = { display: "grid", gridTemplateColumns: "1fr 2fr", gap: 30 };

const panel = { border: "1px solid #1e293b", borderRadius: 20, padding: 20, background: "rgba(2,6,23,0.7)" };
const panelWide = { ...panel };

const panelTitle = { color: "#38bdf8", fontWeight: "bold", marginBottom: 14 };

const controlRow = { display: "flex", gap: 10, marginBottom: 16 };

const dayRow = { display: "grid", gridTemplateColumns: "80px repeat(6,1fr)", gap: 6, marginBottom: 6 };
const dayLabel = { color: "#7dd3fc", fontSize: 12 };

const input = { background: "#020617", border: "1px solid #1e293b", color: "#38bdf8", padding: 8 };
const miniInput = { ...input, fontSize: 11 };
const select = input;

const chartGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };

const chartBox = { border: "1px solid #1e293b", borderRadius: 16, padding: 12 };
const chartTitle = { fontSize: 12, color: "#7dd3fc", marginBottom: 6 };

const aiPanel = { marginTop: 20 };
const aiButton = { width: "100%", padding: 14, background: "#38bdf8", border: "none", borderRadius: 12, fontWeight: "bold" };
const aiTextStyle = { marginTop: 10, whiteSpace: "pre-wrap", color: "#cbd5f5" };
