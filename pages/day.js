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
  const fiveYearProjection = surplus * 60 * 1.45;

  const chartData = [
    { name: "Now", value: surplus },
    { name: "Y1", value: surplus * 12 * 1.08 },
    { name: "Y3", value: surplus * 36 * 1.25 },
    { name: "Y5", value: surplus * 60 * 1.45 },
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
        <h1 style={title}>WEALTHYAI · PRO INTELLIGENCE</h1>
        <p style={subtitle}>
          Thank you for choosing the <strong>1-Day Professional Access</strong>.
        </p>
      </div>

      <div style={layout}>
        <div>
          <Metric label="MONTHLY SURPLUS" value={`$${surplus.toLocaleString()}`} />
          <Metric label="SAVINGS RATE" value={`${savingsRate.toFixed(1)}%`} />
          <Metric
            label="5Y PROJECTION"
            value={`$${Math.round(fiveYearProjection).toLocaleString()}`}
          />

          <div style={aiBox}>
            <button onClick={askAI} style={aiButton}>
              {loading ? "ANALYZING…" : "GENERATE AI STRATEGY"}
            </button>
            <pre style={aiTextStyle}>{aiText}</pre>
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
            <MiniChart title="Cash Flow Projection" data={chartData} />
            <MiniBar title="Expense Distribution" value={data.fixed + data.variable} />
          </div>
        </div>
      </div>

      <div style={upsell}>
        Weekly and Monthly plans unlock country-specific tax optimization,
        stress testing and advanced projections.
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
  const data = [{ name: "Value", v: value }];
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
  color: "#e5e7eb",
  padding: "40px",
  fontFamily: "Inter, system-ui, sans-serif",
  backgroundColor: "#020617",
  backgroundImage: `
    repeating-linear-gradient(
      -25deg,
      rgba(56,189,248,0.06) 0px,
      rgba(56,189,248,0.06) 1px,
      transparent 1px,
      transparent 180px
    ),
    repeating-linear-gradient(
      35deg,
      rgba(167,139,250,0.05) 0px,
      rgba(167,139,250,0.05) 1px,
      transparent 1px,
      transparent 260px
    ),
    radial-gradient(circle at 20% 30%, rgba(56,189,248,0.18), transparent 45%),
    radial-gradient(circle at 80% 60%, rgba(167,139,250,0.18), transparent 50%),
    radial-gradient(circle at 45% 85%, rgba(34,211,238,0.14), transparent 45%),
    url("/wealthyai/icons/generated.png")
  `,
  backgroundRepeat: "repeat, repeat, no-repeat, no-repeat, no-repeat, repeat",
  backgroundSize: "auto, auto, 100% 100%, 100% 100%, 100% 100%, 560px auto",
  backgroundPosition: "center",
};

const header = { marginBottom: "30px" };
const title = { fontSize: "2.6rem", margin: 0 };
const subtitle = { color: "#94a3b8", marginTop: "10px", maxWidth: "700px" };

const layout = {
  display: "grid",
  gridTemplateColumns: "1fr 1.3fr",
  gap: "40px",
};

const metric = { marginBottom: "25px" };
const metricLabel = { color: "#7dd3fc", fontSize: "0.8rem" };
const metricValue = { fontSize: "2.2rem", fontWeight: "bold" };

const aiBox = {
  marginTop: "30px",
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "20px",
};

const aiButton = {
  width: "100%",
  padding: "12px",
  background: "#38bdf8",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer",
};

const aiTextStyle = {
  marginTop: "12px",
  whiteSpace: "pre-wrap",
  color: "#cbd5f5",
};

const inputPanel = {
  marginBottom: "20px",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "15px",
};

const inputRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px",
};

const input = {
  background: "transparent",
  border: "none",
  color: "#38bdf8",
  textAlign: "right",
  width: "120px",
};

const chartGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};

const chartBox = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "10px",
};

const chartTitle = {
  fontSize: "0.75rem",
  color: "#7dd3fc",
  marginBottom: "6px",
};

const upsell = {
  marginTop: "20px",
  textAlign: "center",
  color: "#f8fafc",
  fontWeight: 500,
};
