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

      {/* NAV */}
      <div style={nav}>
        <a href="/" style={navBtn}>← Back to WealthyAI Home</a>
        <a href="/how-to-use" style={navBtnAlt}>How to use Weekly & Monthly</a>
      </div>

      {/* HEADER */}
      <h1 style={title}>WEALTHYAI · WEEKLY INTELLIGENCE</h1>
      <p style={subtitle}>
        Thank you for choosing the <strong>Weekly Behavioral Analysis</strong>.  
        This module detects spending patterns and adapts insights to your country.
      </p>

      {/* COUNTRY */}
      <div style={card}>
        <label style={label}>Country context</label>
        <select value={country} onChange={e => setCountry(e.target.value)} style={select}>
          <option value="US">United States</option>
          <option value="DE">Germany</option>
          <option value="UK">United Kingdom</option>
          <option value="HU">Hungary</option>
        </select>
        <p style={hint}>
          Active context: {COUNTRY_NAMES[country]}
        </p>
      </div>

      {/* INCOME */}
      <div style={card}>
        <label style={label}>Income</label>
        <div style={{ display: "flex", gap: 10 }}>
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
        <p style={hint}>Weekly baseline: ${weeklyIncome.toFixed(0)}</p>
      </div>

      <div style={layout}>

        {/* INPUTS */}
        <div style={left}>
          {DAYS.map(d => (
            <details key={d} open style={dayBox}>
              <summary style={dayTitle}>{d}</summary>
              {CATEGORIES.map(c => (
                <div key={c} style={row}>
                  <span>{c.toUpperCase()}</span>
                  <input
                    type="number"
                    value={week[d][c]}
                    onChange={e => update(d, c, e.target.value)}
                    style={input}
                  />
                </div>
              ))}
            </details>
          ))}
        </div>

        {/* CHARTS */}
        <div style={right}>
          <Chart title="Daily total spending">
            <LineChart data={chartData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line dataKey="total" stroke="#38bdf8" strokeWidth={3} />
            </LineChart>
          </Chart>

          <Chart title="Category trends">
            <LineChart data={chartData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              {CATEGORIES.map(c => (
                <Line key={c} dataKey={c} stroke={COLORS[c]} />
              ))}
            </LineChart>
          </Chart>

          <Chart title="Weekly distribution">
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={80}>
                {pieData.map((p, i) => (
                  <Cell key={i} fill={COLORS[p.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </Chart>

          <Chart title="Spending momentum">
            <AreaChart data={chartData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area dataKey="total" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.25} />
            </AreaChart>
          </Chart>

          <Chart title="Daily dispersion">
            <ScatterChart>
              <XAxis dataKey="x" />
              <YAxis dataKey="y" />
              <Tooltip />
              <Scatter data={scatterData} fill="#a78bfa" />
            </ScatterChart>
          </Chart>

          <div style={summary}>
            Weekly spend: <strong>${weeklySpend}</strong> · Income: <strong>${weeklyIncome.toFixed(0)}</strong>
          </div>

          {/* AI */}
          <div style={aiBox}>
            <button onClick={runAI} style={aiButton}>
              {loading ? "Analyzing…" : "Run Weekly AI Analysis"}
            </button>
            <pre style={aiTextStyle}>
              {aiText || "AI will analyze your weekly behavior once data is provided."}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ===== UI HELPERS ===== */

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

/* ===== STYLES ===== */

const page = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #020617, #000)",
  color: "#e5e7eb",
  padding: 40,
  fontFamily: "Inter, system-ui",
};

const nav = { display: "flex", gap: 16, marginBottom: 20 };
const navBtn = {
  border: "1px solid #38bdf8",
  color: "#38bdf8",
  padding: "8px 16px",
  borderRadius: 10,
  textDecoration: "none",
  fontSize: 13,
};
const navBtnAlt = { ...navBtn, borderColor: "#a78bfa", color: "#a78bfa" };

const title = { fontSize: "2.6rem" };
const subtitle = { color: "#94a3b8", marginBottom: 30 };

const layout = { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 30 };

const left = { maxHeight: "70vh", overflowY: "auto" };
const right = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };

const card = { border: "1px solid #1e293b", borderRadius: 14, padding: 16, marginBottom: 20 };

const dayBox = { ...card, marginBottom: 12 };
const dayTitle = { cursor: "pointer", color: "#38bdf8", fontWeight: "bold" };

const row = { display: "flex", justifyContent: "space-between", marginBottom: 8 };

const input = {
  background: "transparent",
  border: "none",
  borderBottom: "1px solid #38bdf8",
  color: "#38bdf8",
  width: 90,
  textAlign: "right",
};

const select = { background: "#020617", color: "#38bdf8", border: "1px solid #1e293b", padding: 8 };

const label = { color: "#7dd3fc", fontSize: 12 };
const hint = { fontSize: 11, color: "#64748b" };

const chartBox = { border: "1px solid #1e293b", borderRadius: 14, padding: 12 };
const chartTitle = { fontSize: 12, color: "#7dd3fc", marginBottom: 6 };

const summary = { gridColumn: "1 / -1", textAlign: "right", marginTop: 10 };

const aiBox = {
  gridColumn: "1 / -1",
  border: "1px solid #1e293b",
  borderRadius: 14,
  padding: 16,
  marginTop: 10,
};

const aiButton = {
  width: "100%",
  padding: 14,
  background: "#38bdf8",
  border: "none",
  borderRadius: 10,
  fontWeight: "bold",
  cursor: "pointer",
};

const aiTextStyle = {
  marginTop: 10,
  whiteSpace: "pre-wrap",
  color: "#cbd5f5",
};
