import React, { useEffect, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function PremiumDashboard() {
  const [data, setData] = useState({
    income: 5000,
    fixed: 2000,
    variable: 1500
  });
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("userFinancials");
    if (saved) setData(JSON.parse(saved));
  }, []);

  const monthlySurplus = data.income - (data.fixed + data.variable);
  const yearly = monthlySurplus * 12;

  const chartData = [
    { name: "NOW", spending: data.fixed + data.variable, growth: 0 },
    { name: "Y1", spending: yearly * 0.9, growth: yearly * 1.08 },
    { name: "Y3", spending: yearly * 2.5, growth: yearly * 3.2 },
    { name: "Y5", spending: yearly * 4.2, growth: yearly * 5.8 }
  ];

  const runAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      setAiText(json.insight);
    } catch {
      setAiText("AI analysis temporarily unavailable.");
    }
    setLoading(false);
  };

  return (
    <div style={page}>
      <div style={container}>
        
        {/* HEADER */}
        <div style={header}>
          <h1 style={title}>WEALTHYAI · PRO ANALYTICS</h1>
          <p style={subtitle}>1-Day Professional Financial Intelligence Access</p>
        </div>

        {/* DATA WALL */}
        <div style={chartWrap}>
          <ResponsiveContainer width="100%" height={420}>
            <ComposedChart data={chartData}>
              <CartesianGrid stroke="#0f2a44" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#6fbaff" />
              <YAxis stroke="#6fbaff" />
              <Tooltip
                contentStyle={{
                  background: "#020617",
                  border: "1px solid #0ea5e9",
                  color: "#e0f2fe"
                }}
              />
              <Bar
                dataKey="spending"
                barSize={40}
                fill="#0ea5e9"
                opacity={0.35}
              />
              <Line
                type="monotone"
                dataKey="growth"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* LIVE METRICS */}
        <div style={metrics}>
          <div>
            <span style={metricLabel}>MONTHLY SURPLUS</span>
            <div style={metricValue}>${monthlySurplus.toLocaleString()}</div>
          </div>
          <div>
            <span style={metricLabel}>SAVINGS RATE</span>
            <div style={metricValue}>
              {((monthlySurplus / data.income) * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <span style={metricLabel}>5Y PROJECTION</span>
            <div style={metricValue}>
              ${(yearly * 5.8).toLocaleString()}
            </div>
          </div>
        </div>

        {/* AI PANEL */}
        <div style={aiPanel}>
          <h3 style={{ marginBottom: 10 }}>🤖 AI STRATEGY ENGINE</h3>
          <button onClick={runAI} style={aiBtn}>
            {loading ? "ANALYZING DATA…" : "GENERATE STRATEGY"}
          </button>
          <pre style={aiBox}>
            {aiText || "Run AI analysis to generate your professional strategy."}
          </pre>
        </div>

      </div>
    </div>
  );
}

/* ===== STYLES ===== */

const page = {
  minHeight: "100vh",
  background: "#020617",
  color: "#e0f2fe",
  fontFamily: "Inter, system-ui, sans-serif"
};

const container = {
  maxWidth: 1400,
  margin: "0 auto",
  padding: "40px"
};

const header = { marginBottom: 30 };
const title = { letterSpacing: "0.12em", fontSize: 22 };
const subtitle = { opacity: 0.7 };

const chartWrap = {
  background: "linear-gradient(180deg,#020617,#020617)",
  border: "1px solid #0f2a44",
  padding: 20,
  borderRadius: 8
};

const metrics = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  marginTop: 30,
  gap: 20
};

const metricLabel = { fontSize: 11, opacity: 0.6 };
const metricValue = {
  fontSize: 28,
  color: "#38bdf8",
  marginTop: 4
};

const aiPanel = {
  marginTop: 40,
  padding: 25,
  border: "1px solid #0f2a44",
  background: "#020617"
};

const aiBtn = {
  background: "#0ea5e9",
  color: "#020617",
  padding: "10px 16px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  marginBottom: 15
};

const aiBox = {
  whiteSpace: "pre-line",
  fontSize: 13,
  lineHeight: 1.6,
  color: "#bae6fd"
};
