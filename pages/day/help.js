import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function DayPremium() {
  const [data, setData] = useState({
    income: 5000,
    fixed: 2000,
    variable: 1500,
  });

  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("userFinancials");
    if (saved) setData(JSON.parse(saved));
  }, []);

  const surplus = data.income - (data.fixed + data.variable);
  const savingsRate = data.income > 0 ? (surplus / data.income) * 100 : 0;

  const chartData = [
    { name: "Now", value: surplus },
    { name: "Y1", value: surplus * 12 * 1.08 },
    { name: "Y3", value: surplus * 36 * 1.25 },
    { name: "Y5", value: surplus * 60 * 1.45 },
  ];

  const askAI = async () => {
    setLoading(true);
    setAiOpen(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "day",
          income: data.income,
          fixed: data.fixed,
          variable: data.variable,
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
      <a href="/day/help" style={helpButton}>Help</a>

      <div style={header}>
        <h1 style={title}>WEALTHYAI · PRO INTELLIGENCE</h1>
        <p style={subtitle}>
          Daily financial clarity with short-term intelligence.
        </p>
      </div>

      <div style={layout}>
        <div>
          <Metric label="MONTHLY SURPLUS" value={`$${surplus.toLocaleString()}`} />
          <Metric label="SAVINGS RATE" value={`${savingsRate.toFixed(1)}%`} />

          <button onClick={askAI} style={aiButton}>
            {loading ? "ANALYZING…" : "GENERATE AI STRATEGY"}
          </button>

          {aiOpen && (
            <div style={aiBox}>
              <div style={aiHeader}>
                <strong>AI Insight</strong>
                <button onClick={() => setAiOpen(false)} style={closeBtn}>✕</button>
              </div>
              <pre style={aiTextStyle}>{aiText}</pre>
            </div>
          )}
        </div>

        <div>
          <div style={inputPanel}>
            {["income", "fixed", "variable"].map((k) => (
              <div key={k} style={inputRow}>
                <span>{k.toUpperCase()}</span>
                <input
                  type="number"
                  value={data[k]}
                  onChange={(e) =>
                    setData({ ...data, [k]: Number(e.target.value) })
                  }
                  style={input}
                />
              </div>
            ))}
          </div>

          <div style={chartGrid}>
            <MiniChart title="Cash Flow Projection" data={chartData} />
            <MiniBar title="Expense Distribution" value={data.fixed + data.variable} />
          </div>
        </div>
      </div>

      <div style={footerRow}>
        <span>© 2026 WealthyAI — All rights reserved.</span>
        <span style={upsell}>
          Weekly and Monthly plans unlock deeper intelligence.
        </span>
      </div>
    </div>
  );
}

/* ===== COMPONENTS ===== */

function Metric({ label, value }) {
  return (
    <div style={metric}>
      <div style={metricLabel}>{label}</div>
      <div style={metricValue}>{value}</div>
    </div>
  );
}

function MiniChart({ title, data }) {
  return (
    <div style={chartBox}>
      <div style={chartTitle}>{title}</div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <CartesianGrid stroke="#0f172a" />
          <XAxis dataKey="name" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip />
          <Line dataKey="value" stroke="#38bdf8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniBar({ title, value }) {
  return (
    <div style={chartBox}>
      <div style={chartTitle}>{title}</div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={[{ v: value }]}>
          <Bar dataKey="v" fill="#22d3ee" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ===== STYLES ===== */

const page = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  padding: 40,
  fontFamily: "Inter, system-ui",
  backgroundColor: "#020617",
  color: "#e5e7eb",
  backgroundImage: `
    repeating-linear-gradient(-25deg, rgba(56,189,248,0.06) 0px, rgba(56,189,248,0.06) 1px, transparent 1px, transparent 180px),
    repeating-linear-gradient(35deg, rgba(167,139,250,0.05) 0px, rgba(167,139,250,0.05) 1px, transparent 1px, transparent 260px),
    radial-gradient(circle at 20% 30%, rgba(56,189,248,0.18), transparent 45%),
    radial-gradient(circle at 80% 60%, rgba(167,139,250,0.18), transparent 50%),
    radial-gradient(circle at 45% 85%, rgba(34,211,238,0.14), transparent 45%),
    url("/wealthyai/icons/generated.png")
  `,
  backgroundRepeat: "repeat, repeat, no-repeat, no-repeat, no-repeat, repeat",
  backgroundSize: "auto, auto, 100% 100%, 100% 100%, 100% 100%, 280px auto",
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

const header = { marginBottom: 30 };
const title = { fontSize: "2.6rem", margin: 0 };
const subtitle = { color: "#e5e7eb", marginTop: 10 };

const layout = { display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 40 };

const footerRow = {
  marginTop: "auto",
  display: "flex",
  justifyContent: "space-between",
  fontSize: 13,
  color: "#cbd5f5",
};

const upsell = { fontWeight: 500 };

const metric = { marginBottom: 20 };
const metricLabel = { color: "#7dd3fc", fontSize: 12 };
const metricValue = { fontSize: "2rem", fontWeight: "bold" };

const aiBox = { marginTop: 20, border: "1px solid #1e293b", padding: 16, borderRadius: 12 };
const aiHeader = { display: "flex", justifyContent: "space-between" };
const closeBtn = { background: "none", border: "none", color: "#94a3b8", cursor: "pointer" };

const aiButton = { width: "100%", padding: 12, background: "#38bdf8", border: "none", borderRadius: 6, fontWeight: "bold" };
const aiTextStyle = { marginTop: 10, whiteSpace: "pre-wrap" };

const inputPanel = { border: "1px solid #1e293b", padding: 15, borderRadius: 12 };
const inputRow = { display: "flex", justifyContent: "space-between", marginBottom: 10 };
const input = { background: "transparent", border: "none", color: "#38bdf8" };

const chartGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };
const chartBox = { border: "1px solid #1e293b", padding: 10, borderRadius: 12 };
const chartTitle = { fontSize: 12, color: "#7dd3fc", marginBottom: 6 };
