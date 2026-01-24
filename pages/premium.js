import { useEffect, useState } from "react";

export default function PremiumDashboard() {
  const [data, setData] = useState({ income: 5000, fixed: 2000, variable: 1500 });
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("userFinancials");
    if (saved) setData(JSON.parse(saved));
  }, []);

  const surplus = data.income - (data.fixed + data.variable);
  const savingsRate = data.income > 0 ? (surplus / data.income) * 100 : 0;
  const fiveYearProjection = surplus * 60 * 1.45;
  const unrealized = surplus * 60 * 0.45;

  const askAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      {/* BACKGROUND GRID */}
      <svg width="100%" height="100%" style={svg}>
        {[...Array(9)].map((_, i) => (
          <line
            key={i}
            x1="0"
            x2="100%"
            y1={`${i * 12}%`}
            y2={`${i * 12}%`}
            stroke="#0f172a"
            strokeWidth="1"
          />
        ))}

        {/* BARS */}
        {[15, 28, 22, 35, 26, 42, 31].map((h, i) => (
          <rect
            key={i}
            x={`${18 + i * 9}%`}
            y={`${60 - h}%`}
            width="4%"
            height={`${h}%`}
            fill="rgba(34,211,238,0.35)"
          />
        ))}

        {/* LINE */}
        <polyline
          points="18,52 27,38 36,44 45,30 54,36 63,22 72,34"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="4"
        />
      </svg>

      {/* HEADER */}
      <div style={header}>
        <h1 style={title}>WEALTHYAI · PRO INTELLIGENCE</h1>
        <p style={subtitle}>1-Day Professional Financial Access</p>
      </div>

      {/* METRICS */}
      <div style={metrics}>
        <Metric label="MONTHLY SURPLUS" value={`$${surplus.toLocaleString()}`} />
        <Metric label="SAVINGS RATE" value={`${savingsRate.toFixed(1)}%`} />
        <Metric
          label="5Y PROJECTION"
          value={`$${Math.round(fiveYearProjection).toLocaleString()}`}
        />
      </div>

      {/* AI NOTE */}
      <div style={aiNote}>
        <h3 style={aiTitle}>AI MARKET NOTE</h3>
        <p style={aiTextStyle}>
          Your current financial structure is <strong>stable</strong>. Maintaining
          this trajectory could unlock{" "}
          <strong>${Math.round(unrealized).toLocaleString()}</strong> in unrealized
          growth over 5 years.
        </p>
      </div>

      {/* AI STRATEGY */}
      <div style={aiPanel}>
        <button onClick={askAI} style={aiButton} disabled={loading}>
          {loading ? "ANALYZING…" : "GENERATE AI STRATEGY"}
        </button>
        <pre style={aiOutput}>
          {aiText || "Run AI analysis to generate your professional strategy."}
        </pre>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={metricBox}>
      <div style={metricLabel}>{label}</div>
      <div style={metricValue}>{value}</div>
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  position: "relative",
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #020617, #000)",
  color: "#e5e7eb",
  fontFamily: "Inter, system-ui, sans-serif",
  overflow: "hidden",
};

const svg = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
};

const header = {
  position: "relative",
  zIndex: 2,
  padding: "50px 70px 10px",
};

const title = {
  fontSize: "3rem",
  letterSpacing: "1px",
  margin: 0,
};

const subtitle = {
  marginTop: "6px",
  color: "#94a3b8",
};

const metrics = {
  position: "relative",
  zIndex: 2,
  display: "flex",
  gap: "60px",
  padding: "40px 70px",
};

const metricBox = {
  minWidth: "220px",
};

const metricLabel = {
  fontSize: "0.8rem",
  color: "#7dd3fc",
  letterSpacing: "1px",
};

const metricValue = {
  fontSize: "2.4rem",
  fontWeight: "bold",
};

const aiNote = {
  position: "relative",
  zIndex: 2,
  marginLeft: "70px",
  marginTop: "20px",
  maxWidth: "520px",
  padding: "24px",
  background: "rgba(2,6,23,0.75)",
  border: "1px solid #1e293b",
  borderRadius: "14px",
};

const aiTitle = {
  margin: 0,
  marginBottom: "10px",
  letterSpacing: "1px",
};

const aiTextStyle = {
  lineHeight: "1.6",
  color: "#cbd5f5",
};

const aiPanel = {
  position: "absolute",
  right: "70px",
  bottom: "60px",
  width: "420px",
  zIndex: 2,
};

const aiButton = {
  width: "100%",
  padding: "14px",
  background: "#38bdf8",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
};

const aiOutput = {
  marginTop: "15px",
  padding: "16px",
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "10px",
  minHeight: "140px",
  whiteSpace: "pre-wrap",
  color: "#e5e7eb",
};
