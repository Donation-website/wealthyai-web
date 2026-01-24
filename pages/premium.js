import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PremiumDashboard() {
  const [data, setData] = useState({ income: 5000, fixed: 2000, variable: 1500 });
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("userFinancials");
    if (saved) setData(JSON.parse(saved));
  }, []);

  const surplus = data.income - (data.fixed + data.variable);
  const savingsRate =
    data.income > 0 ? (surplus / data.income) * 100 : 0;

  const chartData = [
    { name: "Now", total: 0 },
    { name: "Y1", total: surplus * 12 * 1.08 },
    { name: "Y3", total: surplus * 36 * 1.25 },
    { name: "Y5", total: surplus * 60 * 1.45 },
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
    <main style={page}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* WELCOME */}
        <h1> Welcome to WealthyAI – 1 Day Pro Access</h1>
        <p style={{ opacity: 0.75, maxWidth: 700 }}>
          Thank you for choosing WealthyAI. You now have access to advanced
          financial analytics, AI-driven insights and professional projections.
        </p>

        {/* INPUTS + METRICS */}
        <div style={grid}>
          <div style={card}>
            <h3>Inputs</h3>
            {["income", "fixed", "variable"].map((k) => (
              <div key={k} style={row}>
                <span>{k}</span>
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

          <div style={card}>
            <h3>Key Metrics</h3>
            <p>Monthly Surplus: <strong>${surplus}</strong></p>
            <p>Savings Rate: <strong>{savingsRate.toFixed(1)}%</strong></p>
            <p>Risk Level: <strong>{savingsRate < 10 ? "High" : "Low"}</strong></p>
          </div>
        </div>

        {/* CHART */}
        <div style={card}>
          <h3>Wealth Acceleration Projection</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#22d3ee"
                fill="#22d3ee"
                fillOpacity={0.15}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI */}
        <div style={card}>
          <h3>AI Strategy Engine</h3>
          <button onClick={askAI} style={aiBtn} disabled={loading}>
            {loading ? "Analyzing…" : "Generate AI Strategy"}
          </button>
          <div style={aiBox}>
            {aiResponse || "Run AI analysis to generate your professional strategy."}
          </div>
        </div>

        {/* ACTIONS */}
        <div style={{ marginTop: 30, display: "flex", gap: 16 }}>
          <a href="/" style={outlineBtn}>← Back to WealthyAI Home</a>
          <a href="/how-to-use" style={outlineBtnAlt}>
            Learn more about Weekly & Monthly →
          </a>
        </div>
      </div>
    </main>
  );
}

/* STYLES */
const page = {
  minHeight: "100vh",
  background: "#020617",
  color: "#f8fafc",
  padding: "40px",
  fontFamily: "Arial, sans-serif",
};

const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 };

const card = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 14,
  padding: 24,
  marginTop: 20,
};

const row = { display: "flex", justifyContent: "space-between", marginBottom: 12 };

const input = {
  background: "#020617",
  border: "1px solid #334155",
  color: "#22d3ee",
  borderRadius: 6,
  padding: 6,
  width: 120,
};

const aiBtn = {
  marginTop: 10,
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  padding: 12,
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};

const aiBox = {
  marginTop: 15,
  background: "#020617",
  border: "1px solid #1e293b",
  padding: 14,
  borderRadius: 8,
  minHeight: 120,
  whiteSpace: "pre-line",
};

const outlineBtn = {
  border: "1px solid #38bdf8",
  color: "#38bdf8",
  padding: "10px 16px",
  borderRadius: 8,
  textDecoration: "none",
};

const outlineBtnAlt = {
  ...outlineBtn,
  borderColor: "#a78bfa",
  color: "#a78bfa",
};
