import { useState } from "react";
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

/* ===== MAIN ===== */

export default function PremiumWeek() {
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

  /* ===== RENDER ===== */

  return (
    <div style={page}>

      <h1 style={title}>WEALTHYAI · WEEKLY INTELLIGENCE</h1>
      <p style={subtitle}>
        Multi-dimensional behavioral analysis with income awareness.
      </p>

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

          {/* 1 – DAILY TOTAL LINE */}
          <Chart title="Daily total spending">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#0f172a" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line dataKey="total" stroke="#38bdf8" strokeWidth={3} />
            </LineChart>
          </Chart>

          {/* 2 – MULTI LINE */}
          <Chart title="Category trends by day">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#0f172a" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              {CATEGORIES.map(c => (
                <Line key={c} dataKey={c} stroke={COLORS[c]} />
              ))}
            </LineChart>
          </Chart>

          {/* 3 – STACKED BAR */}
          <Chart title="Daily spending composition">
            <BarChart data={chartData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              {CATEGORIES.map(c => (
                <Bar key={c} dataKey={c} stackId="a" fill={COLORS[c]} />
              ))}
            </BarChart>
          </Chart>

          {/* 4 – AREA (HEGY) */}
          <Chart title="Spending momentum">
            <AreaChart data={chartData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area dataKey="total" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.25} />
            </AreaChart>
          </Chart>

          {/* 5 – PIE */}
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

          {/* 6 – SCATTER */}
          <Chart title="Daily spending dispersion">
            <ScatterChart>
              <XAxis dataKey="x" name="Day" />
              <YAxis dataKey="y" name="Spend" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={scatterData} fill="#a78bfa" />
            </ScatterChart>
          </Chart>

          <div style={summary}>
            Weekly spend: <strong>${weeklySpend}</strong> · Income: <strong>${weeklyIncome.toFixed(0)}</strong>
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

const title = { fontSize: "2.6rem" };
const subtitle = { color: "#94a3b8", marginBottom: 30 };

const layout = { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 30 };

const left = { maxHeight: "75vh", overflowY: "auto" };
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

const summary = { marginTop: 20, gridColumn: "1 / -1", textAlign: "right" };
