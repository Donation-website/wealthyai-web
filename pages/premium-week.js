import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";

export default function PremiumWeek() {
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const [country, setCountry] = useState("auto");
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  const [daily, setDaily] = useState(
    DAYS.map(day => ({
      day,
      rent: 40,
      food: 35,
      transport: 15,
      entertainment: 20,
    }))
  );

  const update = (i, k, v) => {
    const copy = [...daily];
    copy[i][k] = Number(v);
    setDaily(copy);
  };

  const chartData = daily.map(d => ({
    ...d,
    total: d.rent + d.food + d.transport + d.entertainment,
  }));

  const weeklyTotal = chartData.reduce((a, b) => a + b.total, 0);

  const runAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "weekly",
          country,
          data: chartData,
          weeklyTotal,
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
      {/* HEADER */}
      <h1 style={title}>WEALTHYAI · WEEKLY ANALYSIS</h1>
      <p style={subtitle}>
        Behavioral spending patterns with country-aware intelligence.
      </p>

      {/* MAIN SPLIT */}
      <div style={split}>

        {/* LEFT – INPUTS */}
        <div style={leftCol}>
          <div style={card}>
            <label style={label}>Country context</label>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              style={select}
            >
              <option value="auto">Auto detect</option>
              <option value="US">United States</option>
              <option value="DE">Germany</option>
              <option value="UK">United Kingdom</option>
              <option value="HU">Hungary</option>
            </select>
          </div>

          <div style={inputScroll}>
            {daily.map((d, i) => (
              <div key={i} style={card}>
                <strong>{d.day}</strong>
                {["rent", "food", "transport", "entertainment"].map(k => (
                  <input
                    key={k}
                    type="number"
                    value={d[k]}
                    onChange={e => update(i, k, e.target.value)}
                    style={input}
                    placeholder={k}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT – CHARTS */}
        <div style={rightCol}>
          <div style={chartCard}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#0f172a" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line dataKey="total" stroke="#38bdf8" strokeWidth={3} />
                <Line dataKey="rent" stroke="#f472b6" />
                <Line dataKey="food" stroke="#34d399" />
                <Line dataKey="transport" stroke="#facc15" />
                <Line dataKey="entertainment" stroke="#a78bfa" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={summary}>
            Weekly total: <strong>${weeklyTotal}</strong>
          </div>
        </div>
      </div>

      {/* AI */}
      <div style={aiBox}>
        <button onClick={runAI} style={aiButton}>
          {loading ? "ANALYZING…" : "RUN WEEKLY AI OPTIMIZATION"}
        </button>
        <pre style={aiTextStyle}>
          {aiText || "AI will analyze volatility, habits and country patterns."}
        </pre>
      </div>

      {/* NAV */}
      <div style={nav}>
        <a href="/" style={btn}>← Back to Home</a>
        <a href="/how-to-use" style={btnAlt}>Monthly →</a>
      </div>
    </div>
  );
}

/* ===== STYLES ===== */

const page = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #020617, #000)",
  color: "#e5e7eb",
  padding: "40px",
  fontFamily: "Inter, system-ui, sans-serif",
};

const title = { fontSize: "2.4rem" };
const subtitle = { color: "#94a3b8", marginBottom: "30px" };

const split = {
  display: "grid",
  gridTemplateColumns: "1fr 1.2fr",
  gap: "30px",
};

const leftCol = {};
const rightCol = {};

const inputScroll = {
  maxHeight: "420px",
  overflowY: "auto",
  paddingRight: "8px",
};

const card = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "16px",
  marginBottom: "14px",
};

const input = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid #38bdf8",
  color: "#38bdf8",
  padding: "6px 0",
  marginTop: "8px",
};

const label = { fontSize: "0.75rem", color: "#7dd3fc" };

const select = {
  width: "100%",
  background: "#020617",
  color: "#38bdf8",
  border: "1px solid #1e293b",
  padding: "8px",
  borderRadius: "8px",
};

const chartCard = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "16px",
  padding: "18px",
};

const summary = {
  marginTop: "16px",
  fontSize: "1.1rem",
};

const aiBox = {
  marginTop: "40px",
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "16px",
  padding: "22px",
};

const aiButton = {
  width: "100%",
  padding: "14px",
  background: "#38bdf8",
  color: "#000",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
};

const aiTextStyle = {
  marginTop: "14px",
  whiteSpace: "pre-wrap",
  color: "#cbd5f5",
};

const nav = {
  marginTop: "40px",
  display: "flex",
  justifyContent: "center",
  gap: "16px",
};

const btn = {
  border: "1px solid #38bdf8",
  color: "#38bdf8",
  padding: "10px 18px",
  borderRadius: "10px",
  textDecoration: "none",
};

const btnAlt = {
  ...btn,
  borderColor: "#a78bfa",
  color: "#a78bfa",
};
