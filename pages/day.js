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

  useEffect(() => {
    const saved = localStorage.getItem("userFinancials");
    if (saved) setData(JSON.parse(saved));
  }, []);

  const surplus = data.income - (data.fixed + data.variable);
  const savingsRate =
    data.income > 0 ? (surplus / data.income) * 100 : 0;

  const chartData = [
    { name: "Now", value: surplus },
    { name: "7d", value: surplus * 7 },
  ];

  const askAI = async () => {
    setLoading(true);
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
      <div style={header}>
        <h1 style={title}>WEALTHYAI · DAILY INTELLIGENCE</h1>
        <p style={subtitle}>
          A focused daily financial pulse with short-term clarity.
        </p>
      </div>

      <div style={layout}>
        <div>
          <Metric label="TODAY'S SURPLUS" value={`$${surplus.toLocaleString()}`} />
          <Metric label="SAVINGS RATE" value={`${savingsRate.toFixed(1)}%`} />

          <div style={aiBox}>
            <button onClick={askAI} style={aiButton}>
              {loading ? "ANALYZING…" : "RUN DAILY AI INSIGHT"}
            </button>
            <pre style={aiTextStyle}>
              {aiText || "Run the daily AI pulse to understand your current financial state."}
            </pre>
          </div>
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
            <MiniChart title="Short-term surplus outlook" data={chartData} />
            <MiniBar title="Expense load" value={data.fixed + data.variable} />
          </div>
        </div>
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
          <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniBar({ title, value }) {
  const data = [{ name: "Total", v: value }];
  return (
    <div style={chartBox}>
      <div style={chartTitle}>{title}</div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Bar dataKey="v" fill="#22d3ee" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ===== STYLES ===== */

const page = {
  minHeight: "100vh",
  padding: "40px",
  color: "#e5e7eb",
  fontFamily: "Inter, system-ui, sans-serif",
  backgroundColor: "#020617",
};

const header = { marginBottom: 30 };
const title = { fontSize: "2.4rem", margin: 0 };
const subtitle = { color: "#94a3b8", marginTop: 10 };

const layout = {
  display: "grid",
  gridTemplateColumns: "1fr 1.2fr",
  gap: 40,
};

const metric = { marginBottom: 24 };
const metricLabel = { color: "#7dd3fc", fontSize: "0.75rem" };
const metricValue = { fontSize: "2.1rem", fontWeight: "bold" };

const aiBox = {
  marginTop: 24,
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 12,
  padding: 20,
};

const aiButton = {
  width: "100%",
  padding: 12,
  background: "#38bdf8",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  cursor: "pointer",
};

const aiTextStyle = {
  marginTop: 12,
  whiteSpace: "pre-wrap",
  color: "#cbd5f5",
};

const inputPanel = {
  border: "1px solid #1e293b",
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
};

const inputRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 10,
};

const input = {
  background: "transparent",
  border: "none",
  color: "#38bdf8",
  textAlign: "right",
  width: 120,
};

const chartGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const chartBox = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 12,
  padding: 10,
};

const chartTitle = {
  fontSize: "0.75rem",
  color: "#7dd3fc",
  marginBottom: 6,
};
