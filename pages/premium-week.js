import { useState } from "react";
import {
  LineChart, Line,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  XAxis, YAxis, Tooltip, Legend,
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
  const [incomeValue] = useState(3000);

  const [week, setWeek] = useState(
    DAYS.reduce((acc, d) => {
      acc[d] = CATEGORIES.reduce((o, c) => ({ ...o, [c]: 0 }), {});
      return acc;
    }, {})
  );

  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  const weeklyIncome = incomeValue / 4;

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
  }));

  const runAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "weekly",
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

  return (
    <div style={page}>
      {/* === FUTURISTIC BACKGROUND (SAFE) === */}
      <div style={bgBase} />
      <div style={bgChartGhosts} />
      <div style={bgFlow} />

      {/* HELP */}
      <a href="/help" style={helpButton}>Help</a>

      <h1 style={title}>WEALTHYAI · WEEKLY INTELLIGENCE</h1>
      <p style={subtitle}>
        Weekly behavioral analysis with country-aware intelligence.
      </p>

      <div style={layout}>
        <div style={left}>
          {DAYS.map((d, i) => (
            <details key={d} open={i === 0} style={dayBox}>
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

        <div style={right}>
          <Chart title="Daily total spending">
            <LineChart data={chartData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line dataKey="total" stroke="#38bdf8" strokeWidth={3} />
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

          <div style={aiBox}>
            <button onClick={runAI} style={aiButton}>
              {loading ? "Analyzing…" : "Run Weekly AI Analysis"}
            </button>
            <pre style={aiTextStyle}>{aiText}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== COMPONENT ===== */

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
  position: "relative",
  background: "#020617",
  color: "#e5e7eb",
  padding: 40,
  fontFamily: "Inter, system-ui",
  overflow: "hidden",
};

/* === BACKGROUND COMBO (NO GRID) === */

const bgBase = {
  position: "fixed",
  inset: 0,
  background: "#020617",
  zIndex: 0,
  pointerEvents: "none",
};

const bgChartGhosts = {
  position: "fixed",
  inset: 0,
  background:
    "radial-gradient(circle at 20% 30%, rgba(56,189,248,0.18), transparent 45%)," +
    "radial-gradient(circle at 70% 40%, rgba(167,139,250,0.15), transparent 50%)," +
    "radial-gradient(circle at 50% 80%, rgba(34,211,238,0.12), transparent 55%)",
  zIndex: 1,
  pointerEvents: "none",
};

const bgFlow = {
  position: "fixed",
  inset: 0,
  backgroundImage:
    "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.10) 50%, transparent 100%)",
  backgroundSize: "1800px 1800px",
  zIndex: 2,
  pointerEvents: "none",
};

/* === UI === */

const helpButton = {
  position: "absolute",
  top: 24,
  right: 24,
  padding: "8px 14px",
  borderRadius: 10,
  fontSize: 13,
  textDecoration: "none",
  color: "#7dd3fc",
  border: "1px solid #1e293b",
  background: "rgba(2,6,23,0.6)",
  zIndex: 10,
};

const title = { fontSize: "2.6rem", position: "relative", zIndex: 5 };
const subtitle = { color: "#94a3b8", marginBottom: 30, position: "relative", zIndex: 5 };

const layout = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: 30,
  position: "relative",
  zIndex: 5,
};

const left = { maxHeight: "70vh", overflowY: "auto" };
const right = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };

const glass = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: 14,
};

const dayBox = { ...glass, padding: 16, marginBottom: 12 };
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

const chartBox = { ...glass, padding: 12 };
const chartTitle = { fontSize: 12, color: "#7dd3fc", marginBottom: 6 };

const summary = { gridColumn: "1 / -1", textAlign: "right", marginTop: 10 };

const aiBox = { ...glass, padding: 16, gridColumn: "1 / -1" };
const aiButton = {
  width: "100%",
  padding: 14,
  background: "#38bdf8",
  border: "none",
  borderRadius: 10,
  fontWeight: "bold",
};

const aiTextStyle = { marginTop: 10, whiteSpace: "pre-wrap" };
