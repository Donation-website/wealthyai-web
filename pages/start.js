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
      "🚨 Your expenses exceed your income. This snapshot signals pressure, not stability."
    );
    insights.push(
      "Advanced AI plans help identify recovery paths and stress points."
    );
  }

  if (data.subscriptions > data.income * 0.08) {
    insights.push(
      "Subscriptions are relatively high. This often hides unnoticed monthly leakage."
    );
  }

  if (savingsRate >= 20) {
    insights.push(
      "You are saving at a healthy rate. This supports short-term stability."
    );
  } else if (balance >= 0) {
    insights.push(
      "Savings are positive, but below the resilience threshold."
    );
  }

  /* ===== STRIPE ===== */

  const handleCheckout = async (priceId) => {
    localStorage.setItem("userFinancials", JSON.stringify(data));

    try {
      const res = await fetch("/api/create-stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const session = await res.json();
      if (session.url) {
        window.location.href = session.url;
      } else {
        alert("Payment initialization failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Payment initialization failed.");
    }
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
    transition: "transform .2s, box-shadow .2s",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        color: "white",
        fontFamily: "Inter, system-ui, sans-serif",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('/wealthyai/icons/hat.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1>Your Financial Overview (Basic)</h1>
        <p style={{ opacity: 0.75 }}>
          This view shows a snapshot — not behavior, not direction.
        </p>

        {/* GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* INPUTS */}
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

          {/* INSIGHTS */}
          <div style={card}>
            <h3>Insights (Basic)</h3>
            <p>Risk Level: <strong>{riskLevel}</strong></p>
            <p>Savings Score: <strong>{savingsScore}/100</strong></p>

            <ul>
              {insights.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* PRICING */}
        <div style={{ marginTop: 60, textAlign: "center" }}>
          <h2>Go deeper when you’re ready</h2>

          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            <div onClick={() => handleCheckout("price_1SscYJDyLtejYlZiyDvhdaIx")} style={priceCard}>
              <h3>1 Day · $9.99</h3>
              <small>Clarity snapshot + AI strategy</small>
            </div>

            <div onClick={() => handleCheckout("price_1SscaYDyLtejYlZiDjSeF5Wm")} style={priceCard}>
              <h3>1 Week · $14.99</h3>
              <small>Behavior & country-aware analysis</small>
            </div>

            <div onClick={() => handleCheckout("price_1SscbeDyLtejYlZixJcT3B4o")} style={priceCard}>
              <h3>1 Month · $24.99</h3>
              <small>Direction, projections & exportable insights</small>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
