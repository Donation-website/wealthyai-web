import React, { useState } from "react";

export default function UserDashboard() {
  const [data, setData] = useState({
    income: 5000,
    fixed: 2000,
    variable: 1500,
    subscriptions: 120,
  });

  /* ===== CALCULATIONS ===== */

  const totalExpenses = data.fixed + data.variable + data.subscriptions;
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

  /* ===== STRIPE ===== */

  const handleCheckout = async (priceId) => {
    localStorage.setItem("userFinancials", JSON.stringify(data));

    const res = await fetch("/api/create-stripe-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const session = await res.json();
    if (session.url) window.location.href = session.url;
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

        {/* CENTERED TITLE */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1>Your Financial Overview (Basic)</h1>
        </div>

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* INPUTS */}
          <div style={card}>
            <h3>Income & Expenses</h3>

            {[
              ["Monthly Income ($)", "income"],
              ["Fixed Expenses", "fixed"],
              ["Variable Expenses", "variable"],
              ["Subscriptions", "subscriptions"],
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

          {/* INSIGHTS + GRAPH */}
          <div style={card}>
            <h3>Insights (Basic)</h3>

            <p>Risk Level: <strong>{riskLevel}</strong></p>
            <p>Savings Score: <strong>{savingsScore}/100</strong></p>

            {/* SIMPLE RADAR / WEB GRAPH */}
            <svg width="100%" height="160" viewBox="0 0 200 160">
              <line x1="100" y1="20" x2="100" y2="140" stroke="#38bdf8" />
              <line x1="20" y1="80" x2="180" y2="80" stroke="#38bdf8" />
              <circle cx="100" cy={80 - savingsRate} r="6" fill="#22d3ee" />
              <text x="104" y="20" fill="#94a3b8" fontSize="10">Savings</text>
              <text x="150" y="76" fill="#94a3b8" fontSize="10">Expenses</text>
            </svg>

            <p style={{ opacity: 0.65, marginTop: "12px" }}>
              This view shows a snapshot — not behavior, not direction.
            </p>
          </div>
        </div>

        {/* ORIENTATION BLOCK */}
        <div style={{ marginTop: "70px", textAlign: "center" }}>
          <h2 className="pulse-title">
            Choose your depth of financial intelligence
          </h2>

          <p style={{ maxWidth: 700, margin: "18px auto", opacity: 0.85 }}>
            Different questions require different levels of context.
          </p>
        </div>

        {/* PRICING */}
        <div style={{ marginTop: "50px", textAlign: "center" }}>
          <h2>Unlock Advanced AI Intelligence</h2>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
              marginTop: "30px",
            }}
          >
            <div style={card} onClick={() => handleCheckout("price_day")}>
              <h3>1 Day · $9.99</h3>
            </div>
            <div style={card} onClick={() => handleCheckout("price_week")}>
              <h3>1 Week · $14.99</h3>
            </div>
            <div style={card} onClick={() => handleCheckout("price_month")}>
              <h3>1 Month · $24.99</h3>
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
