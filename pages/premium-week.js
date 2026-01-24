import { useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const CATEGORIES = [
  "rent",
  "food",
  "transport",
  "entertainment",
  "subscriptions",
  "utilities",
  "other",
];

const LABELS = {
  rent: "Rent / Loan / Mortgage",
  food: "Food",
  transport: "Transport",
  entertainment: "Entertainment",
  subscriptions: "Subscriptions",
  utilities: "Utilities / Bills",
  other: "Other",
};

export default function PremiumWeek() {
  const [country, setCountry] = useState("auto");
  const [openDay, setOpenDay] = useState(0);

  const [week, setWeek] = useState(
    DAYS.map(() =>
      CATEGORIES.reduce((acc, c) => ({ ...acc, [c]: 0 }), {})
    )
  );

  const updateValue = (dayIndex, category, value) => {
    const copy = [...week];
    copy[dayIndex][category] = Number(value);
    setWeek(copy);
  };

  const dailyTotal = (day) =>
    Object.values(day).reduce((a, b) => a + b, 0);

  const weeklyTotal = week.reduce((sum, d) => sum + dailyTotal(d), 0);

  return (
    <div style={page}>
      <h1 style={title}>WEALTHYAI · WEEKLY ANALYSIS</h1>
      <p style={subtitle}>
        Behavioral spending analysis with country-aware financial context
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
          Country affects cost ratios, savings logic and AI recommendations.
        </p>
      </div>

      {/* DAYS */}
      {DAYS.map((day, i) => (
        <div key={day} style={card}>
          <div
            style={dayHeader}
            onClick={() => setOpenDay(openDay === i ? -1 : i)}
          >
            <strong>{day}</strong>
            <span>${dailyTotal(week[i])}</span>
          </div>

          {openDay === i && (
            <div style={grid}>
              {CATEGORIES.map((cat) => (
                <div key={cat}>
                  <label style={label}>{LABELS[cat]}</label>
                  <input
                    type="number"
                    value={week[i][cat]}
                    onChange={(e) =>
                      updateValue(i, cat, e.target.value)
                    }
                    style={input}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* SUMMARY */}
      <div style={summary}>
        <span>Total weekly spend</span>
        <strong>${weeklyTotal}</strong>
      </div>

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

const card = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "18px",
  marginBottom: "16px",
};

const dayHeader = {
  display: "flex",
  justifyContent: "space-between",
  cursor: "pointer",
  color: "#7dd3fc",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "16px",
  marginTop: "16px",
};

const label = {
  fontSize: "0.75rem",
  color: "#7dd3fc",
  marginBottom: "4px",
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
