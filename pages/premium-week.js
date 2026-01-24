import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
  rent: "Rent / Loan",
  food: "Food",
  transport: "Transport",
  entertainment: "Entertainment",
  subscriptions: "Subscriptions",
  utilities: "Utilities",
  other: "Other",
};

const COLORS = ["#38bdf8", "#22d3ee", "#a78bfa", "#f472b6", "#facc15", "#4ade80", "#fb7185"];

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

  /* ===== DERIVED DATA ===== */

  const dailyTotals = week.map((d, i) => ({
    day: DAYS[i],
    total: Object.values(d).reduce((a, b) => a + b, 0),
    ...d,
  }));

  const weeklyTotal = dailyTotals.reduce((a, b) => a + b.total, 0);

  const pieData = CATEGORIES.map((c) => ({
    name: LABELS[c],
    value: week.reduce((sum, d) => sum + d[c], 0),
  })).filter(d => d.value > 0);

  const fixedVsVariable = dailyTotals.map(d => ({
    day: d.day,
    fixed: d.rent + d.utilities,
    variable: d.total - (d.rent + d.utilities),
  }));

  const weekdayAvg =
    dailyTotals.slice(0, 5).reduce((a, b) => a + b.total, 0) / 5;
  const weekendAvg =
    dailyTotals.slice(5).reduce((a, b) => a + b.total, 0) / 2;

  /* ===== UI ===== */

  return (
    <div style={page}>
      <h1 style={title}>WEALTHYAI · WEEKLY ANALYSIS</h1>
      <p style={subtitle}>
        Behavioral spending analysis & country-aware optimization
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

      {/* INPUT DAYS */}
      {DAYS.map((day, i) => (
        <div key={day} style={card}>
          <div style={dayHeader} onClick={() => setOpenDay(openDay === i ? -1 : i)}>
            <strong>{day}</strong>
            <span>${dailyTotals[i].total}</span>
          </div>

          {openDay === i && (
            <div style={grid}>
              {CATEGORIES.map((cat) => (
                <div key={cat}>
                  <label style={label}>{LABELS[cat]}</label>
                  <input
                    type="number"
                    value={week[i][cat]}
                    onChange={(e) => updateValue(i, cat, e.target.value)}
                    style={input}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* ===== CHARTS ===== */}

      <div style={chartsGrid}>

        {/* 1 DAILY TOTAL */}
        <ChartBox title="Daily Total Spend">
          <LineChart data={dailyTotals}>
            <CartesianGrid stroke="#1e293b" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line dataKey="total" stroke="#38bdf8" strokeWidth={3} />
          </LineChart>
        </ChartBox>

        {/* 2 STACKED BAR */}
        <ChartBox title="Category Breakdown">
          <BarChart data={dailyTotals}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            {CATEGORIES.map((c, i) => (
              <Bar key={c} dataKey={c} stackId="a" fill={COLORS[i]} />
            ))}
          </BarChart>
        </ChartBox>

        {/* 3 FIXED VS VARIABLE */}
        <ChartBox title="Fixed vs Variable">
          <BarChart data={fixedVsVariable}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="fixed" fill="#f472b6" />
            <Bar dataKey="variable" fill="#38bdf8" />
          </BarChart>
        </ChartBox>

        {/* 4 PIE */}
        <ChartBox title="Top Cost Drivers">
          <PieChart>
            <Pie data={pieData} dataKey="value" outerRadius={80}>
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartBox>

        {/* 5 WEEKDAY VS WEEKEND */}
        <ChartBox title="Weekday vs Weekend Avg">
          <BarChart
            data={[
              { name: "Weekday", value: weekdayAvg },
              { name: "Weekend", value: weekendAvg },
            ]}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#a78bfa" />
          </BarChart>
        </ChartBox>

      </div>

      <div style={summary}>
        <span>Total weekly spend</span>
        <strong>${weeklyTotal}</strong>
      </div>
    </div>
  );
}

/* ===== REUSABLE ===== */

function ChartBox({ title, children }) {
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

const chartsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "20px",
  marginTop: "40px",
};

const chartBox = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "14px",
};

const chartTitle = {
  fontSize: "0.75rem",
  color: "#7dd3fc",
  marginBottom: "8px",
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

const summary = {
  marginTop: "40px",
  fontSize: "1.3rem",
  display: "flex",
  justifyContent: "space-between",
};
