import React, { useState } from "react";

export default function UserDashboard() {
  const [data, setData] = useState({
    income: 5000,
    fixed: 2000,
    variable: 1500,
    electricity: 150,
    water: 50,
    gas: 100,
    internet: 80,
    subscriptions: 120,
  });

  /* ===== CALCULATIONS ===== */

  const totalExpenses = data.fixed + data.variable;
  const balance = data.income - totalExpenses;

  const usagePercent =
    data.income > 0 ? Math.min((totalExpenses / data.income) * 100, 100) : 0;

  const savingsRate =
    data.income > 0 ? (balance / data.income) * 100 : 0;

  const savingsScore = Math.max(
    0,
    Math.min(100, Math.round((savingsRate / 30) * 100))
  );

  const riskLevel =
    usagePercent > 90
      ? "High Risk"
      : usagePercent > 70
      ? "Medium Risk"
      : "Low Risk";

  /* ===== INSIGHTS ===== */

  const insights = [];

  if (balance < 0) {
    insights.push(
      "Your expenses exceed your income. Immediate action may be required."
    );
  }

  if (data.subscriptions > data.income * 0.08) {
    insights.push(
      "Subscriptions appear high. Reviewing unused services may free up cash."
    );
  }

  if (savingsRate >= 20) {
    insights.push(
      "You are saving at a healthy rate, supporting long-term stability."
    );
  } else if (balance >= 0) {
    insights.push(
      "Your savings rate is modest. Small adjustments could improve resilience."
    );
  }

  /* ===== STRIPE (DO NOT TOUCH) ===== */

  const handleCheckout = async (priceId) => {
    localStorage.setItem("userFinancials", JSON.stringify(data));

    try {
      const res = await fetch("/api/create-stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const session = await res.json();
      if (session.url) window.location.href = session.url;
      else alert("Payment initialization failed.");
    } catch {
      alert("Payment initialization failed.");
    }
  };

  /* ===== RADAR DATA ===== */

  const radar = [
    { label: "Expense Load", value: usagePercent },
    { label: "Savings Strength", value: Math.min(100, savingsRate * 3) },
    {
      label: "Subscription Weight",
      value:
        data.income > 0
          ? Math.min((data.subscriptions / data.income) * 200, 100)
          : 0,
    },
  ];

  /* ===== RADAR COMPONENT ===== */

  const Radar = ({ data, size = 200 }) => {
    const c = size / 2;
    const r = size / 2 - 24;
    const step = (Math.PI * 2) / data.length;

    const point = (val, i) => {
      const a = i * step - Math.PI / 2;
      const rr = (val / 100) * r;
      return [c + rr * Math.cos(a), c + rr * Math.sin(a)];
    };

    return (
      <svg width={size} height={size} style={{ margin: "20px auto" }}>
        {[0.25, 0.5, 0.75, 1].map((lvl, i) => (
          <circle
            key={i}
            cx={c}
            cy={c}
            r={r * lvl}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
          />
        ))}

        {data.map((_, i) => {
          const a = i * step - Math.PI / 2;
          return (
            <line
              key={i}
              x1={c}
              y1={c}
              x2={c + r * Math.cos(a)}
              y2={c + r * Math.sin(a)}
              stroke="rgba(255,255,255,0.18)"
            />
          );
        })}

        <polygon
          points={data.map((d, i) => point(d.value, i).join(",")).join(" ")}
          fill="rgba(99,102,241,0.35)"
          stroke="rgba(99,102,241,0.9)"
        />

        {data.map((d, i) => {
          const a = i * step - Math.PI / 2;
          return (
            <text
              key={i}
              x={c + (r + 14) * Math.cos(a)}
              y={c + (r + 14) * Math.sin(a)}
              fontSize="11"
              fill="rgba(255,255,255,0.7)"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    );
  };

  /* ===== STYLES ===== */

  const card = {
    background: "rgba(15,23,42,0.65)",
    backdropFilter: "blur(14px)",
    borderRadius: "22px",
    padding: "26px",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  const input = {
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    borderRadius: "8px",
    border: "none",
    background: "rgba(255,255,255,0.08)",
    color: "white",
  };

  const priceCard = {
    ...card,
    textAlign: "center",
    cursor: "pointer",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        color: "white",
        fontFamily: "Inter, system-ui, sans-serif",

        /* ===== BACKGROUND FROM C PAGE ===== */
        backgroundColor: "#020617",
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
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1>Your Financial Overview (Basic)</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={card}>
            <h3>Income & Expenses</h3>

            {[
              ["Monthly Income ($)", "income"],
              ["Fixed Expenses", "fixed"],
              ["Variable Expenses", "variable"],
            ].map(([label, key]) => (
              <div key={key}>
                <label>{label}</label>
                <input
                  type="number"
                  value={data[key]}
                  style={input}
                  onChange={(e) =>
                    setData({ ...data, [key]: Number(e.target.value) })
                  }
                />
              </div>
            ))}
          </div>

          <div style={card}>
            <h3>Insights (Basic)</h3>

            {/* ===== LABEL FIX: padding wrapper ===== */}
            <div style={{ paddingRight: 28 }}>
              <Radar data={radar} />
            </div>

            <p>
              Risk Level: <strong>{riskLevel}</strong>
            </p>
            <p>
              Savings Score: <strong>{savingsScore}/100</strong>
            </p>

            <ul>
              {insights.map((i, idx) => (
                <li key={idx} style={{ marginBottom: 12 }}>
                  {i}
                </li>
              ))}
            </ul>

            <p style={{ opacity: 0.65, marginTop: 18 }}>
              This view shows a snapshot — not behavior, not direction.
            </p>
          </div>
        </div>

        {/* ===== ORIENTATION BLOCK ===== */}
        <div style={{ marginTop: 70, textAlign: "center" }}>
          <h2 className="pulse-title">
            Choose your depth of financial intelligence
          </h2>

          <p style={{ maxWidth: 700, margin: "18px auto", opacity: 0.85 }}>
            Different questions require different levels of context.
            You can choose the depth that matches what you want to understand right now.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
              marginTop: 30,
            }}
          >
            <div style={card}>
              <h4>Daily Intelligence</h4>
              <p>
                Short-term interpretation of your current financial state.
                Best for immediate clarity.
              </p>
            </div>

            <div style={card}>
              <h4>Weekly Intelligence</h4>
              <p>
                Behavioral patterns across days and categories.
                Best for understanding habits.
              </p>
            </div>

            <div style={card}>
              <h4>Monthly Intelligence</h4>
              <p>
                Multi-week context, regional insights, and forward-looking analysis.
                Best when decisions require direction.
              </p>
            </div>
          </div>
        </div>

        {/* ===== PRICING ===== */}
        <div style={{ marginTop: 60 }}>
          <h2 style={{ textAlign: "center", marginBottom: 30 }}>
            Unlock Advanced AI Intelligence
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div
              style={priceCard}
              onClick={() =>
                handleCheckout("price_1SscYJDyLtejYlZiyDvhdaIx")
              }
            >
              <h3>1 Day · $9.99</h3>
              <small>Immediate clarity</small>
            </div>

            <div
              style={priceCard}
              onClick={() =>
                handleCheckout("price_1SscaYDyLtejYlZiDjSeF5Wm")
              }
            >
              <h3>1 Week · $14.99</h3>
              <small>Behavior & patterns</small>
            </div>

            <div
              style={priceCard}
              onClick={() =>
                handleCheckout("price_1SscbeDyLtejYlZixJcT3B4o")
              }
            >
              <h3>1 Month · $24.99</h3>
              <small>Full intelligence engine</small>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .pulse-title {
          animation: pulseSoft 3s ease-in-out infinite;
        }
        @keyframes pulseSoft {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </main>
  );
}
