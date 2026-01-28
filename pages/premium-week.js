import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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

export default function PremiumWeek() {
  const router = useRouter();

  /* ===== STRIPE ACCESS CONTROL (ADDED – DO NOT TOUCH) ===== */
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const tier = localStorage.getItem("tier");
    const expiresAt = Number(localStorage.getItem("expiresAt"));

    if (!tier || !expiresAt || Date.now() > expiresAt) {
      router.replace("/start");
      return;
    }

    if (tier !== "week") {
      router.replace("/start");
      return;
    }

    setAuthorized(true);
    setChecking(false);
  }, []);

  if (checking) return null;

  /* ===== ORIGINAL STATES ===== */

  const [incomeType, setIncomeType] = useState("monthly");
  const [incomeValue, setIncomeValue] = useState(3000);
  const [country, setCountry] = useState("US");

  const [aiOpen, setAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lang = navigator.language || "";
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

    if (lang.startsWith("hu") || tz.includes("Budapest")) setCountry("HU");
    else if (lang.startsWith("en-GB")) setCountry("UK");
    else if (lang.startsWith("en")) setCountry("US");
    else setCountry("EU");
  }, []);
  const [week, setWeek] = useState(
    DAYS.reduce((acc, d) => {
      acc[d] = CATEGORIES.reduce((o, c) => ({ ...o, [c]: 0 }), {});
      return acc;
    }, {})
  );

  const weeklyIncome =
    incomeType === "daily" ? incomeValue * 7 :
    incomeType === "weekly" ? incomeValue :
    incomeValue / 4;

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

  const runAI = async () => {
    setLoading(true);
    setAiOpen(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "week",
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
  return (
    <div style={page}>
      <a href="/help" style={helpButton}>Help</a>

      {/* HEADER */}
      <div style={header}>
        <h1 style={title}>WEALTHYAI · WEEKLY INTELLIGENCE</h1>
        <p style={subtitle}>
          Weekly behavioral analysis with country-aware intelligence.
        </p>
      </div>

      <div style={regionRow}>
        <span style={regionLabel}>Region</span>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          style={regionSelect}
        >
          <option value="US">United States</option>
          <option value="EU">European Union</option>
          <option value="UK">United Kingdom</option>
          <option value="HU">Hungary</option>
        </select>
      </div>

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

          <Chart title="Daily dispersion">
            <ScatterChart>
              <XAxis dataKey="x" />
              <YAxis dataKey="y" />
              <Tooltip />
              <Scatter data={scatterData} fill="#a78bfa" />
            </ScatterChart>
          </Chart>

          <div style={summary}>
            Weekly spend: <strong>${weeklySpend}</strong> ·
            Income: <strong>${weeklyIncome.toFixed(0)}</strong>
          </div>

          <button onClick={runAI} style={aiButton}>
            {loading ? "Analyzing…" : "Run Weekly AI Analysis"}
          </button>

          {aiOpen && (
            <div style={aiBox}>
              <div style={aiHeader}>
                <strong>Weekly AI Insight</strong>
                <button onClick={() => setAiOpen(false)} style={closeBtn}>✕</button>
              </div>
              <pre style={aiTextStyle}>{aiText}</pre>
            </div>
          )}
        </div>
      </div>

      {/* UPSell – bottom center */}
      <div style={upsellRow}>
        Monthly plans unlock country-specific tax optimization,
        stress testing and advanced projections.
      </div>

      {/* COPYRIGHT – bottom left */}
      <div style={copyright}>
        © 2026 WealthyAI — All rights reserved.
      </div>
    </div>
  );
}
/* ===== COMPONENTS ===== */

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
  padding: 40,
  fontFamily: "Inter, system-ui",
  backgroundColor: "#020617",
  color: "#e5e7eb",
  backgroundImage: `
    repeating-linear-gradient(-25deg, rgba(56,189,248,0.07) 0px, rgba(56,189,248,0.07) 1px, transparent 1px, transparent 160px),
    repeating-linear-gradient(35deg, rgba(167,139,250,0.06) 0px, rgba(167,139,250,0.06) 1px, transparent 1px, transparent 220px),
    radial-gradient(circle at 20% 30%, rgba(56,189,248,0.22), transparent 40%),
    radial-gradient(circle at 80% 60%, rgba(167,139,250,0.22), transparent 45%),
    radial-gradient(circle at 45% 85%, rgba(34,211,238,0.18), transparent 40%),
    url("/wealthyai/icons/generated.png")
  `,
  backgroundRepeat: "repeat, repeat, no-repeat, no-repeat, no-repeat, repeat",
  backgroundSize: "auto, auto, 100% 100%, 100% 100%, 100% 100%, 420px auto",
};

const header = {
  textAlign: "center",
  marginBottom: 20,
};

const title = { fontSize: "2.6rem", margin: 0 };
const subtitle = { color: "#f8fafc", marginTop: 10 };

const upsellRow = {
  position: "absolute",
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: 13,
  color: "#f8fafc",
  fontWeight: 500,
};

const copyright = {
  position: "absolute",
  bottom: 20,
  left: 40,
  fontSize: 13,
  color: "#cbd5f5",
};

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
};

const regionRow = { marginBottom: 20 };
const regionLabel = { marginRight: 8, color: "#7dd3fc" };
const regionSelect = {
  background: "#020617",
  color: "#e5e7eb",
  border: "1px solid #1e293b",
  padding: "6px 10px",
  borderRadius: 6,
};

const layout = { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 30 };
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
const aiHeader = { display: "flex", justifyContent: "space-between", marginBottom: 10 };
const closeBtn = { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" };

const aiButton = {
  width: "100%",
  padding: 14,
  background: "#38bdf8",
  border: "none",
  borderRadius: 10,
  fontWeight: "bold",
};

const aiTextStyle = { marginTop: 10, whiteSpace: "pre-wrap" };
