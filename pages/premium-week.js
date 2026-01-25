import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CATEGORIES = ["rent", "food", "transport", "entertainment", "subscriptions", "other"];

export default function PremiumWeek() {
  const [country, setCountry] = useState("auto");

  const [weekData, setWeekData] = useState(
    DAYS.reduce((acc, d) => {
      acc[d] = CATEGORIES.reduce((c, k) => ({ ...c, [k]: 0 }), {});
      return acc;
    }, {})
  );

  /* ===== HELPERS ===== */

  const updateValue = (day, key, value) => {
    setWeekData({
      ...weekData,
      [day]: { ...weekData[day], [key]: Number(value) }
    });
  };

  const dailyTotals = DAYS.map(d =>
    Object.values(weekData[d]).reduce((a, b) => a + b, 0)
  );

  const weeklyTotal = dailyTotals.reduce((a, b) => a + b, 0);

  const chartData = DAYS.map((d, i) => ({
    day: d,
    total: dailyTotals[i],
    ...weekData[d],
  }));

  /* ===== RENDER ===== */

  return (
    <div style={page}>

      {/* HEADER */}
      <h1 style={title}>WEALTHYAI · WEEKLY INTELLIGENCE</h1>
      <p style={subtitle}>
        Behavioral spending patterns with country-aware intelligence.
      </p>

      {/* COUNTRY */}
      <div style={card}>
        <label style={label}>Country context</label>
        <select value={country} onChange={(e) => setCountry(e.target.value)} style={select}>
          <option value="auto">Auto detect</option>
          <option value="US">United States</option>
          <option value="DE">Germany</option>
          <option value="UK">United Kingdom</option>
          <option value="HU">Hungary</option>
        </select>
      </div>

      {/* MAIN GRID */}
      <div style={layout}>

        {/* LEFT – INPUTS */}
        <div style={inputsCol}>
          {DAYS.map(day => (
            <details key={day} style={dayBox} open>
              <summary style={dayTitle}>{day}</summary>

              {CATEGORIES.map(cat => (
                <div key={cat} style={inputRow}>
                  <span>{cat.toUpperCase()}</span>
                  <input
                    type="number"
                    value={weekData[day][cat]}
                    onChange={(e) => updateValue(day, cat, e.target.value)}
                    style={input}
                  />
                </div>
              ))}
            </details>
          ))}
        </div>

        {/* RIGHT – CHARTS */}
        <div style={chartsCol}>

          {/* LINE – DAILY TOTAL */}
          <ChartBox title="Daily Total Spend ($)">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#0f172a" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line dataKey="total" stroke="#38bdf8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>

          {/* BAR – CATEGORY DISTRIBUTION */}
          <ChartBox title="Category Distribution (Weekly)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                {CATEGORIES.map((c, i) => (
                  <Bar key={c} dataKey={c} stackId="a" fill={COLORS[i]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>

          <div style={totalBox}>
            Weekly total: <strong>${weeklyTotal}</strong>
          </div>

          {/* AI PLACEHOLDER */}
          <div style={aiBox}>
            AI weekly optimization will analyze:
            <ul>
              <li>Which days overspend</li>
              <li>Category spikes</li>
              <li>Country-specific benchmarks</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ===== UI HELPERS ===== */

function ChartBox({ title, children }) {
  return (
    <div style={chartBox}>
      <div style={chartTitle}>{title}</div>
      {children}
    </div>
  );
}

/* ===== COLORS ===== */
const COLORS = ["#38bdf8", "#22d3ee", "#34d399", "#a78bfa", "#f472b6", "#facc15"];

/* ===== STYLES ===== */

const page = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #020617, #000)",
  color: "#e5e7eb",
  padding: "40px",
  fontFamily: "Inter, system-ui, sans-serif",
};

const title = { fontSize: "2.6rem", marginBottom: "6px" };
const subtitle = { color: "#94a3b8", marginBottom: "30px" };

const layout = {
  display: "grid",
  gridTemplateColumns: "1.1fr 1fr",
  gap: "30px",
};

const inputsCol = { maxHeight: "70vh", overflowY: "auto" };
const chartsCol = { display: "flex", flexDirection: "column", gap: "20px" };

const card = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "18px",
  marginBottom: "20px",
};

const label = { fontSize: "0.75rem", color: "#7dd3fc" };

const select = {
  width: "100%",
  background: "#020617",
  color: "#38bdf8",
  border: "1px solid #1e293b",
  padding: "8px",
  borderRadius: "8px",
};

const dayBox = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "14px",
  marginBottom: "12px",
};

const dayTitle = {
  cursor: "pointer",
  fontWeight: "bold",
  color: "#38bdf8",
  marginBottom: "10px",
};

const inputRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
};

const input = {
  background: "transparent",
  border: "none",
  borderBottom: "1px solid #38bdf8",
  color: "#38bdf8",
  width: "90px",
  textAlign: "right",
};

const chartBox = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "12px",
};

const chartTitle = {
  fontSize: "0.8rem",
  color: "#7dd3fc",
  marginBottom: "6px",
};

const totalBox = {
  textAlign: "right",
  fontSize: "1.2rem",
  marginTop: "10px",
};

const aiBox = {
  background: "#020617",
  border: "1px dashed #38bdf8",
  borderRadius: "14px",
  padding: "14px",
  fontSize: "0.85rem",
  color: "#cbd5f5",
};
