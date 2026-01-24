import { useState } from "react";

export default function PremiumWeek() {
  const [country, setCountry] = useState("auto");

  const [weekly, setWeekly] = useState({
    food: 120,
    coffee: 25,
    transport: 40,
    entertainment: 60,
    subscriptions: 20,
    other: 30,
  });

  const totalWeekly =
    weekly.food +
    weekly.coffee +
    weekly.transport +
    weekly.entertainment +
    weekly.subscriptions +
    weekly.other;

  return (
    <div style={page}>
      <h1 style={title}>WEALTHYAI · WEEKLY ANALYSIS</h1>
      <p style={subtitle}>
        Behavioral spending analysis & country-aware optimization
      </p>

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
          suggestions.
        </p>
      </div>

      {/* WEEKLY INPUTS */}
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

      {/* SUMMARY */}
      <div style={summary}>
        <span>Total weekly spend</span>
        <strong>${totalWeekly}</strong>
      </div>

      {/* NEXT */}
      <button style={button}>
        Run Weekly AI Optimization
      </button>
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

const title = { fontSize: "2.4rem", marginBottom: "6px" };
const subtitle = { color: "#94a3b8", marginBottom: "30px" };

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
  fontSize: "1.1rem",
  padding: "6px 0",
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

const button = {
  marginTop: "30px",
  width: "100%",
  padding: "16px",
  background: "#38bdf8",
  color: "#000",
  fontWeight: "bold",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
};
