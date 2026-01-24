import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ResponsiveContainer, AreaChart, Area
} from "recharts";

export default function PremiumWeek() {
  /* ===== STATE ===== */
  const [country, setCountry] = useState("auto");
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  const [weekly, setWeekly] = useState({
    food: 120,
    coffee: 25,
    transport: 40,
    entertainment: 60,
    subscriptions: 20,
    other: 30,
  });

  const totalWeekly = Object.values(weekly).reduce((a, b) => a + b, 0);

  /* ===== MOCK DAILY DATA (vizualizációhoz) ===== */
  const dailyData = [
    { day: "Mon", spend: totalWeekly * 0.15 },
    { day: "Tue", spend: totalWeekly * 0.14 },
    { day: "Wed", spend: totalWeekly * 0.18 },
    { day: "Thu", spend: totalWeekly * 0.13 },
    { day: "Fri", spend: totalWeekly * 0.17 },
    { day: "Sat", spend: totalWeekly * 0.14 },
    { day: "Sun", spend: totalWeekly * 0.09 },
  ];

  const categoryData = Object.entries(weekly).map(([k, v]) => ({
    name: k,
    value: v,
  }));

  /* ===== AI CALL ===== */
  const runWeeklyAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "weekly",
          country,
          weekly,
        }),
      });
      const d = await res.json();
      setAiText(d.insight);
    } catch {
      setAiText("AI optimization temporarily unavailable.");
    }
    setLoading(false);
  };

  return (
    <div style={page}>

      {/* ===== HEADER ===== */}
      <div style={header}>
        <h1 style={title}>WEALTHYAI · WEEKLY INTELLIGENCE</h1>
        <p style={subtitle}>
          Thank you for choosing the <strong>Weekly Behavioral Analysis</strong>.
          This module analyzes spending habits, detects patterns and adapts recommendations to your country.
        </p>
      </div>

      {/* ===== COUNTRY ===== */}
      <div style={card}>
        <label style={label}>Country context</label>
        <select value={country} onChange={(e) => setCountry(e.target.value)} style={select}>
          <option value="auto">Auto detect</option>
          <option value="US">United States</option>
          <option value="DE">Germany</option>
          <option value="UK">United Kingdom</option>
          <option value="HU">Hungary</option>
        </select>
        <p style={hint}>
          Country affects taxes, savings targets and spending benchmarks.
        </p>
      </div>

      {/* ===== INPUT GRID ===== */}
      <div style={grid}>
        {Object.entries(weekly).map(([key, value]) => (
          <div key={key} style={card}>
            <label style={label}>{key.toUpperCase()}</label>
            <input
              type="number"
              value={value}
              onChange={(e) =>
                setWeekly({ ...weekly, [key]: Number(e.target.value) })
              }
              style={input}
            />
          </div>
        ))}
      </div>

      {/* ===== SUMMARY ===== */}
      <div style={summary}>
        <span>Total weekly spend</span>
        <strong>${totalWeekly}</strong>
      </div>

      {/* ===== CHARTS (6 DB, HIGH-TECH) ===== */}
      <div style={chartGrid}>

        <ChartBox title="Daily Spending Pattern">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={dailyData}>
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area type="monotone" dataKey="spend" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.25} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Category Distribution">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="value" fill="#22d3ee" />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Impulse Spending Index">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={dailyData}>
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line type="monotone" dataKey="spend" stroke="#a78bfa" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Stability Curve">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={dailyData}>
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area type="monotone" dataKey="spend" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Week-over-Week Stress Model">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={dailyData}>
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line type="monotone" dataKey="spend" stroke="#f472b6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Optimization Potential">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="value" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

      </div>

      {/* ===== AI ===== */}
      <button onClick={runWeeklyAI} style={button}>
        {loading ? "ANALYZING WEEKLY BEHAVIOR…" : "Run Weekly AI Optimization"}
      </button>

      <div style={aiBox}>
        {aiText || "AI will analyze your weekly behavior, detect inefficiencies and suggest country-aware optimizations."}
      </div>

      {/* ===== NAV ===== */}
      <div style={navActions}>
        <a href="/" style={outlineBtn}>← Back to WealthyAI Home</a>
        <a href="/how-to-use" style={outlineBtnAlt}>
          Learn more about Monthly Intelligence →
        </a>
      </div>
    </div>
  );
}

/* ===== COMPONENTS ===== */
function ChartBox({ title, children }) {
  return (
    <div style={chartBox}>
      <div style={chartTitle}>{title}</div>
      {children}
    </div>
  );
}

/* ===== STYLES ===== */
const page = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #020617, #000)",
  color: "#e5e7eb",
  padding: "40px",
  fontFamily: "Inter, system-ui, sans-serif",
};

const header = { marginBottom: "30px" };
const title = { fontSize: "2.5rem", margin: 0 };
const subtitle = { color: "#94a3b8", marginTop: "10px", maxWidth: "800px" };

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginBottom: "30px",
};

const card = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "18px",
};

const label = { fontSize: "0.75rem", color: "#7dd3fc", marginBottom: "6px" };
const input = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid #38bdf8",
  color: "#38bdf8",
  fontSize: "1.1rem",
};

const select = {
  width: "100%",
  background: "#020617",
  color: "#38bdf8",
  border: "1px solid #1e293b",
  padding: "8px",
  borderRadius: "8px",
};

const hint = { fontSize: "0.7rem", color: "#64748b", marginTop: "6px" };

const summary = {
  marginBottom: "30px",
  fontSize: "1.3rem",
  display: "flex",
  justifyContent: "space-between",
};

const chartGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
  marginBottom: "30px",
};

const chartBox = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "12px",
};

const chartTitle = {
  fontSize: "0.75rem",
  color: "#7dd3fc",
  marginBottom: "6px",
};

const button = {
  width: "100%",
  padding: "16px",
  background: "#38bdf8",
  color: "#000",
  fontWeight: "bold",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
};

const aiBox = {
  marginTop: "20px",
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "20px",
  minHeight: "120px",
};

const navActions = {
  marginTop: "30px",
  display: "flex",
  justifyContent: "center",
  gap: "18px",
};

const outlineBtn = {
  border: "1px solid #38bdf8",
  color: "#38bdf8",
  padding: "10px 18px",
  borderRadius: "10px",
  textDecoration: "none",
  fontSize: "0.9rem",
};

const outlineBtnAlt = {
  ...outlineBtn,
  borderColor: "#a78bfa",
  color: "#a78bfa",
};
