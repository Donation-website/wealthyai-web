import React, { useEffect, useState } from "react";
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

export default function PremiumDashboard() {
  const [data, setData] = useState({
    income: 5000,
    fixed: 2000,
    variable: 1500,
  });

  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const monthlySurplus = data.income - (data.fixed + data.variable);
  const savingsRate =
    data.income > 0 ? (monthlySurplus / data.income) * 100 : 0;

  const projectionData = [
    { name: "Now", value: 0 },
    { name: "Y1", value: monthlySurplus * 12 * 1.08 },
    { name: "Y3", value: monthlySurplus * 36 * 1.25 },
    { name: "Y5", value: monthlySurplus * 60 * 1.45 },
  ];

  const breakdownData = [
    { name: "Fixed", value: data.fixed },
    { name: "Variable", value: data.variable },
    { name: "Surplus", value: monthlySurplus },
  ];

  const askAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      setAiResponse(json.insight);
    } catch {
      setAiResponse("AI analysis temporarily unavailable.");
    }
    setLoading(false);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #0b1220, #020617)",
        color: "#e5e7eb",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
        {/* WELCOME */}
        <h1 style={{ fontSize: "2.2rem", marginBottom: "8px" }}>
          WealthyAI · 1-Day Professional Access
        </h1>
        <p style={{ opacity: 0.7, marginBottom: "30px" }}>
          Advanced analytics and AI-driven financial intelligence.
        </p>

        {/* INPUTS */}
        <div style={grid2}>
          <div style={panel}>
            <h3>Financial Inputs</h3>
            {["income", "fixed", "variable"].map((key) => (
              <div key={key} style={inputRow}>
                <span>{key}</span>
                <input
                  type="number"
                  value={data[key]}
                  onChange={(e) =>
                    setData({ ...data, [key]: Number(e.target.value) })
                  }
                  style={input}
                />
              </div>
            ))}
          </div>

          <div style={panel}>
            <h3>Key Metrics</h3>
            <p>Monthly Surplus: <strong>${monthlySurplus.toLocaleString()}</strong></p>
            <p>Savings Rate: <strong>{savingsRate.toFixed(1)}%</strong></p>
            <p>Risk Level: <strong>{savingsRate < 10 ? "High" : "Low"}</strong></p>
          </div>
        </div>

        {/* CHARTS */}
        <div style={grid4}>
          <ChartCard title="5Y Projection">
            <LineChart data={projectionData}>
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} />
            </LineChart>
          </ChartCard>

          <ChartCard title="Expense Breakdown">
            <BarChart data={breakdownData}>
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="value" fill="#38bdf8" />
            </BarChart>
          </ChartCard>

          <ChartCard title="Savings Growth">
            <LineChart data={projectionData}>
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ChartCard>

          <ChartCard title="Capital Efficiency">
            <BarChart data={breakdownData}>
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="value" fill="#a78bfa" />
            </BarChart>
          </ChartCard>
        </div>

        {/* AI */}
        <div style={panel}>
          <h3>AI Strategy Engine</h3>
          <button onClick={askAI} style={aiBtn} disabled={loading}>
            {loading ? "Analyzing…" : "Generate Strategy"}
          </button>
          <div style={aiBox}>
            {aiResponse || "Run AI analysis to generate your professional strategy."}
          </div>
        </div>

        {/* FOOT ACTIONS */}
        <div style={{ marginTop: "30px" }}>
          <a href="/" style={outlineBtn}>← Back to WealthyAI Home</a>
          <a href="/how-to-use" style={outlineBtnAlt}>
            Learn what Weekly & Monthly unlock →
          </a>
        </div>
      </div>
    </main>
  );
}

/* COMPONENTS */
const ChartCard = ({ title, children }) => (
  <div style={chartCard}>
    <h4 style={{ marginBottom: "10px" }}>{title}</h4>
    <ResponsiveContainer width="100%" height={180}>
      {children}
    </ResponsiveContainer>
  </div>
);

/* STYLES */
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" };
const grid4 = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "20px",
  margin: "40px 0",
};
const panel = {
  background: "rgba(15,23,42,0.85)",
  border: "1px solid #1e293b",
  borderRadius: "16px",
  padding: "25px",
};
const chartCard = {
  background: "rgba(15,23,42,0.9)",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "15px",
};
const inputRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "12px",
};
const input = {
  background: "#020617",
  border: "1px solid #334155",
  color: "#22d3ee",
  borderRadius: "6px",
  padding: "6px",
  width: "100px",
};
const aiBtn = {
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  padding: "12px",
  width: "100%",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
};
const aiBox = {
  marginTop: "15px",
  background: "#020617",
  border: "1px solid #1e293b",
  padding: "15px",
  borderRadius: "10px",
  minHeight: "120px",
  whiteSpace: "pre-line",
};
const outlineBtn = {
  display: "inline-block",
  marginRight: "15px",
  padding: "10px 16px",
  border: "1px solid #38bdf8",
  color: "#38bdf8",
  borderRadius: "8px",
  textDecoration: "none",
};
const outlineBtnAlt = {
  ...outlineBtn,
  borderColor: "#a78bfa",
  color: "#a78bfa",
};
