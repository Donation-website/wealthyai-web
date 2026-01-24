import { useState } from "react";

export default function WeeklyInputUI() {
  const [country, setCountry] = useState("DE");

  const [weekly, setWeekly] = useState({
    coffee: 30,
    cigarettes: 0,
    alcohol: 40,
    food: 120,
    bills: 90,
    phone: 25,
    transport: 60,
    misc: 30,
  });

  const update = (k, v) =>
    setWeekly({ ...weekly, [k]: Number(v) });

  return (
    <div style={page}>

      {/* HEADER */}
      <div style={header}>
        <h1 style={title}>WEALTHYAI · WEEKLY ANALYSIS</h1>
        <p style={subtitle}>
          Behavioral spending analysis with country-specific context.
        </p>
      </div>

      {/* COUNTRY SELECT */}
      <div style={panel}>
        <label style={label}>Country Context</label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          style={select}
        >
          <option value="DE">Germany</option>
          <option value="UK">United Kingdom</option>
          <option value="US">United States</option>
          <option value="HU">Hungary</option>
        </select>
        <p style={hint}>
          Used to normalize costs, habits and financial benchmarks.
        </p>
      </div>

      {/* INPUT GRID */}
      <div style={grid}>
        {Object.entries({
          coffee: "☕ Coffee",
          cigarettes: "🚬 Cigarettes",
          alcohol: "🍺 Alcohol & Entertainment",
          food: "🍽 Food (outside)",
          bills: "🧾 Bills",
          phone: "📱 Phone & Subscriptions",
          transport: "🚗 Transport",
          misc: "💸 Miscellaneous",
        }).map(([key, labelText]) => (
          <div key={key} style={inputCard}>
            <div style={inputLabel}>{labelText}</div>
            <input
              type="number"
              value={weekly[key]}
              onChange={(e) => update(key, e.target.value)}
              style={input}
            />
            <div style={unit}>per week</div>
          </div>
        ))}
      </div>

      {/* ACTION */}
      <button style={analyzeBtn}>
        RUN WEEKLY AI BEHAVIOR ANALYSIS
      </button>

      {/* UPSELL */}
      <p style={upsell}>
        Monthly plan unlocks tax optimization, stress testing and
        long-term simulations.
      </p>
    </div>
  );
}

/* ===== STYLES ===== */

const page = {
  minHeight: "100vh",
  padding: "40px",
  background: "radial-gradient(circle at top, #020617, #000)",
  color: "#e5e7eb",
  fontFamily: "Inter, system-ui, sans-serif",
};

const header = { marginBottom: "30px" };
const title = { fontSize: "2.4rem", margin: 0 };
const subtitle = { color: "#94a3b8", marginTop: "8px" };

const panel = {
  marginBottom: "30px",
  padding: "20px",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  background: "#020617",
};

const label = { color: "#7dd3fc", fontSize: "0.85rem" };
const hint = { fontSize: "0.75rem", color: "#64748b", marginTop: "6px" };

const select = {
  width: "100%",
  marginTop: "8px",
  padding: "10px",
  background: "#020617",
  border: "1px solid #1e293b",
  color: "#38bdf8",
  borderRadius: "8px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const inputCard = {
  padding: "16px",
  borderRadius: "14px",
  background: "#020617",
  border: "1px solid #1e293b",
};

const inputLabel = {
  fontSize: "0.85rem",
  color: "#7dd3fc",
  marginBottom: "6px",
};

const input = {
  width: "100%",
  padding: "10px",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid #1e293b",
  color: "#38bdf8",
  fontSize: "1.1rem",
  outline: "none",
};

const unit = {
  fontSize: "0.7rem",
  color: "#64748b",
  marginTop: "4px",
};

const analyzeBtn = {
  marginTop: "30px",
  width: "100%",
  padding: "14px",
  background: "#38bdf8",
  color: "#000",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const upsell = {
  marginTop: "20px",
  textAlign: "center",
  color: "#94a3b8",
};
