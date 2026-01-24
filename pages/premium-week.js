import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PremiumWeek() {
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const [country, setCountry] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [aiText, setAiText] = useState("");

  const [daily, setDaily] = useState(
    DAYS.map((d) => ({
      day: d,
      rent: 40,
      food: 35,
      transport: 15,
      entertainment: 20,
    }))
  );

  const updateValue = (i, key, value) => {
    const copy = [...daily];
    copy[i][key] = Number(value);
    setDaily(copy);
  };

  const dailyTotals = daily.map((d) =>
    d.rent + d.food + d.transport + d.entertainment
  );

  const weeklyTotal = dailyTotals.reduce((a, b) => a + b, 0);

  const chartData = daily.map((d, i) => ({
    day: d.day,
    total: dailyTotals[i],
    rent: d.rent,
    food: d.food,
    transport: d.transport,
    entertainment: d.entertainment,
  }));

  const runWeeklyAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "weekly",
          country,
          days: DAYS,
          data: chartData,
          weeklyTotal,
        }),
      });
      const d = await res.json();
      setAiText(d.insight);
    } catch {
      setAiText("AI system temporarily unavailable.");
    }
    setLoading(false);
  };

  return (
    <div style={page}>
      {/* HEADER */}
      <div style={header}>
        <h1 style={title}>WEALTHYAI · WEEKLY ANALYSIS</h1>
        <p style={subtitle}>
          Thank you for choosing the <strong>Weekly Professional Access</strong>.
          This module analyzes real daily behavior patterns with country-aware
          logic.
        </p>
      </div>

      {/* COUNTRY */}
      <div style={card}>
        <label style={label}>Country context</label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          style={select}
        >
          <option value="auto">Auto detect</option>
          <option value="US">United States</option>
          <option value="DE">Germany</option>
          <option value="UK">United Kingdom</option>
          <option value="HU">Hungary</option>
        </select>
        <p style={hint}>
          Country affects tax logic, savings recommendations and provider
          benchmarks.
        </p>
      </div>

      {/* DAILY INPUT GRID */}
      <div style={grid}>
        {daily.map((d, i) => (
          <div key={i} style={card}>
            <h4>{d.day}</h4>
            {["rent", "food", "transport", "entertainment"].map((k) => (
              <input
                key={k}
                type="number"
                value={d[k]}
                onChange={(e) => updateValue(i, k, e.target.value)}
                style={input}
                placeholder={k}
              />
            ))}
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div style={summary}>
        <span>Total weekly spend</span>
        <strong>${weeklyTotal}</strong>
      </div>

      {/* CHART */}
      <div style={chartBox}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#0f172a" />
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#38bdf8" strokeWidth={3} />
            <Line type="monotone" dataKey="rent" stroke="#f472b6" />
            <Line type="monotone" dataKey="food" stroke="#34d399" />
            <Line type="monotone" dataKey="transport" stroke="#facc15" />
            <Line type="monotone" dataKey="entertainment" stroke="#a78bfa" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI */}
      <div style={aiBox}>
        <button onClick={runWeeklyAI} style={aiButton}>
          {loading ? "ANALYZING WEEKLY PATTERNS…" : "RUN WEEKLY AI OPTIMIZATION"}
        </button>
        <pre style={aiTextStyle}>
          {aiText ||
            "AI will analyze your daily volatility, spending behavior and country-specific patterns."}
        </pre>
      </div>

      {/* NAV */}
      <div style={navActions}>
        <a href="/" style={outlineBtn}>← Back to WealthyAI Home</a>
        <a href="/how-to-use" style={outlineBtnAlt}>
          Learn more about Monthly →
        </a>
      </div>
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
const title = { fontSize: "2.4rem", marginBottom: "6px" };
const subtitle = { color: "#94a3b8", maxWidth: "760px" };

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
};

const card = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "18px",
};

const label = {
  fontSize: "0.75rem",
  color: "#7dd3fc",
  marginBottom: "6px",
  display: "block",
};

const input = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid #38bdf8",
  color: "#38bdf8",
  fontSize: "1rem",
  padding: "6px 0",
  marginBottom: "10px",
};

const select = {
  width: "100%",
  background: "#020617",
  color: "#38bdf8",
  border: "1px solid #1e293b",
  padding: "8px",
  borderRadius: "8px",
};

const hint = {
  fontSize: "0.7rem",
  color: "#64748b",
  marginTop: "6px",
};

const summary = {
  marginTop: "30px",
  fontSize: "1.2rem",
  display: "flex",
  justifyContent: "space-between",
};

const chartBox = {
  marginTop: "30px",
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "18px",
};

const aiBox = {
  marginTop: "40px",
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "22px",
};

const aiButton = {
  width: "100%",
  padding: "14px",
  background: "#38bdf8",
  color: "#000",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
};

const aiTextStyle = {
  marginTop: "14px",
  whiteSpace: "pre-wrap",
  color: "#cbd5f5",
  fontSize: "0.95rem",
  lineHeight: "1.6",
};

const navActions = {
  marginTop: "40px",
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
