import { useEffect, useState } from "react";

export default function PremiumDashboard() {
  const [data, setData] = useState({
    income: 5000,
    fixed: 2000,
    variable: 1500,
  });

  useEffect(() => {
    const saved = localStorage.getItem("userFinancials");
    if (saved) setData(JSON.parse(saved));
  }, []);

  const surplus = data.income - (data.fixed + data.variable);
  const savingsRate = data.income > 0 ? (surplus / data.income) * 100 : 0;
  const projection5Y = surplus * 60 * 1.45;

  return (
    <div style={page}>
      {/* BACKGROUND DATA WALL */}
      <svg viewBox="0 0 1200 500" style={svg}>
        {/* GRID */}
        {[...Array(10)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 50}
            x2="1200"
            y2={i * 50}
            stroke="#0f172a"
            strokeWidth="1"
          />
        ))}

        {/* BARS */}
        {[200, 260, 180, 300, 220, 340, 260].map((h, i) => (
          <rect
            key={i}
            x={100 + i * 120}
            y={400 - h}
            width="40"
            height={h}
            fill="#22d3ee"
            opacity="0.35"
          />
        ))}

        {/* LINE */}
        <polyline
          fill="none"
          stroke="#38bdf8"
          strokeWidth="4"
          points="100,280 220,200 340,260 460,180 580,210 700,140 820,190"
        />

        {/* POINTS */}
        {[100, 220, 340, 460, 580, 700, 820].map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={[280,200,260,180,210,140,190][i]}
            r="6"
            fill="#38bdf8"
          />
        ))}
      </svg>

      {/* OVERLAY CONTENT */}
      <div style={overlay}>
        <h1 style={title}>WEALTHYAI · PRO INTELLIGENCE</h1>
        <p style={subtitle}>1-Day Professional Financial Access</p>

        <div style={statsRow}>
          <Stat label="MONTHLY SURPLUS" value={`$${surplus}`} />
          <Stat label="SAVINGS RATE" value={`${savingsRate.toFixed(1)}%`} />
          <Stat label="5Y PROJECTION" value={`$${projection5Y.toLocaleString()}`} />
        </div>

        <div style={aiBox}>
          <h3 style={{ marginBottom: 10 }}>AI MARKET NOTE</h3>
          <p style={{ opacity: 0.9 }}>
            Your current financial structure is <strong>stable</strong>.  
            Maintaining this trajectory could unlock <strong>${(projection5Y - surplus * 60).toLocaleString()}</strong>  
            in unrealized growth over 5 years.
          </p>
        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */
function Stat({ label, value }) {
  return (
    <div style={stat}>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{value}</div>
    </div>
  );
}

/* STYLES */
const page = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #020617, #000)",
  position: "relative",
  overflow: "hidden",
  color: "#e5e7eb",
  fontFamily: "Inter, sans-serif",
};

const svg = {
  width: "100%",
  height: "500px",
  position: "absolute",
  top: 0,
  left: 0,
};

const overlay = {
  position: "relative",
  zIndex: 2,
  padding: "60px",
};

const title = {
  fontSize: "2.4rem",
  letterSpacing: "1px",
};

const subtitle = {
  opacity: 0.7,
  marginBottom: "40px",
};

const statsRow = {
  display: "flex",
  gap: "40px",
  marginBottom: "40px",
};

const stat = {
  borderLeft: "2px solid #38bdf8",
  paddingLeft: "16px",
};

const statLabel = {
  fontSize: "12px",
  opacity: 0.6,
};

const statValue = {
  fontSize: "1.8rem",
  fontWeight: "bold",
};

const aiBox = {
  maxWidth: "600px",
  background: "rgba(15,23,42,0.7)",
  border: "1px solid #1e293b",
  padding: "20px",
  borderRadius: "12px",
};
