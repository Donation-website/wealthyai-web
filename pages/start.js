// pages/start.js
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
      "Your expenses exceed your income. Immediate action is recommended."
    );
  }

  if (data.subscriptions > data.income * 0.08) {
    insights.push("Subscriptions appear relatively high.");
  }

  if (savingsRate >= 20) {
    insights.push("You are saving at a healthy rate.");
  } else {
    insights.push("Savings rate is below the recommended 20%.");
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
    } catch (e) {
      alert("Unexpected error during checkout.");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        color: "white",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('/wealthyai/icons/hat.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "Arial, sans-serif",
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
            <p style={{ opacity: 0.6, marginTop: "12px" }}>
              Advanced AI strategies available in Premium plans.
            </p>
          </div>
        </div>

        <div style={{ marginTop: "60px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
            Upgrade to Premium
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={pricing}
              onClick={() =>
                handleCheckout("price_1SscYJDyLtejYlZiyDvhdaIx", "day")
              }
            >
              <h3>1 Day Pass</h3>
              <small>AI optimization & insights</small>
            </div>

            <div
              style={pricing}
              onClick={() =>
                handleCheckout("price_1SscaYDyLtejYlZiDjSeF5Wm", "week")
              }
            >
              <h3>1 Week Pass</h3>
              <small>Behavior & trend analysis</small>
            </div>

            <div
              style={pricing}
              onClick={() =>
                handleCheckout("price_1SscbeDyLtejYlZixJcT3B4o", "month")
              }
            >
              <h3>1 Month Pass</h3>
              <small>Full AI financial dashboard</small>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const card = {
  background: "rgba(15,23,42,0.6)",
  borderRadius: "18px",
  padding: "24px",
  border: "1px solid rgba(255,255,255,0.08)",
};

const input = {
  width: "100%",
  marginTop: "6px",
  marginBottom: "12px",
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "rgba(255,255,255,0.08)",
  color: "white",
};

const pricing = {
  background: "rgba(10,18,35,0.9)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "18px",
  padding: "28px",
  textAlign: "center",
  cursor: "pointer",
  minWidth: "220px",
};
