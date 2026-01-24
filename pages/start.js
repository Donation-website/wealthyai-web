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

  const totalExpenses = data.fixed + data.variable;
  const balance = data.income - totalExpenses;

  const usagePercent =
    data.income > 0 ? Math.min((totalExpenses / data.income) * 100, 100) : 0;

  const savingsRate = data.income > 0 ? (balance / data.income) * 100 : 0;
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

  const insights = [];

  if (balance < 0) {
    insights.push(
      "Your expenses exceed your income. Premium AI can provide recovery strategies."
    );
  }

  if (savingsRate >= 20) {
    insights.push("You are saving at a healthy rate.");
  } else {
    insights.push("Consider increasing savings toward 20%.");
  }

  const handleCheckout = async (priceId, tier) => {
    localStorage.setItem("userFinancials", JSON.stringify(data));

    try {
      const res = await fetch("/api/create-stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, tier }),
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

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Inter, Arial, sans-serif",
        color: "white",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/wealthyai/icons/hat.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1>Your Financial Overview (Basic)</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          {/* INPUTS */}
          <div style={card}>
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
            <p>
              Risk Level: <strong>{riskLevel}</strong>
            </p>
            <p>
              Savings Score: <strong>{savingsScore}/100</strong>
            </p>

            <ul>
              {insights.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>

            <p style={{ opacity: 0.7, marginTop: "20px" }}>
              Advanced AI strategies available in premium plans.
            </p>
          </div>
        </div>

        {/* PRICING */}
        <div style={{ marginTop: "60px" }}>
          <h2 style={{ textAlign: "center" }}>
            Unlock Advanced AI Optimization
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              marginTop: "30px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={priceCard}
              onClick={() =>
                handleCheckout(
                  "price_1SscYJDyLtejYlZiyDvhdaIx",
                  "day"
                )
              }
            >
              <h3>1 Day Pass</h3>
              <small>AI strategy & projections</small>
            </div>

            <div
              style={priceCard}
              onClick={() =>
                handleCheckout(
                  "price_1SscaYDyLtejYlZiDjSeF5Wm",
                  "premium-week"
                )
              }
            >
              <h3>1 Week Pass</h3>
              <small>Behavior & country optimization</small>
            </div>

            <div
              style={priceCard}
              onClick={() =>
                handleCheckout(
                  "price_1SscbeDyLtejYlZixJcT3B4o",
                  "premium-month"
                )
              }
            >
              <h3>1 Month Pass</h3>
              <small>Full AI wealth engine</small>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ===== STYLES ===== */

const card = {
  background: "rgba(15,23,42,0.6)",
  backdropFilter: "blur(12px)",
  borderRadius: "20px",
  padding: "24px",
  border: "1px solid rgba(255,255,255,0.1)",
};

const input = {
  width: "100%",
  marginTop: "6px",
  marginBottom: "14px",
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "rgba(255,255,255,0.1)",
  color: "white",
};

const priceCard = {
  background: "rgba(10,18,35,0.85)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "18px",
  padding: "24px",
  textAlign: "center",
  cursor: "pointer",
  minWidth: "220px",
};
