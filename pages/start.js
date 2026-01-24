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
    insights.push(
      "Premium AI provides crisis strategies and recovery roadmaps."
    );
  }

  if (data.subscriptions > data.income * 0.08) {
    insights.push(
      "Subscriptions appear high. Reviewing unused services may free up cash."
    );
  }

  if (balance >= 0 && savingsRate >= 20) {
    insights.push(
      "You are saving at a healthy rate. This supports long-term stability."
    );
  }

  if (balance >= 0 && savingsRate < 20) {
    insights.push(
      "Savings rate is below the recommended 20%. Minor adjustments could help."
    );
  }

  // 🔐 STRIPE / PREMIUM LOGIKA – JAVÍTVA
  const handleCheckout = async (priceId) => {
    // 1️⃣ Ellenőrizzük: van-e aktív prémium
    const access = JSON.parse(localStorage.getItem("premiumAccess"));

    if (access && access.expiresAt && Date.now() < access.expiresAt) {
      // 👉 Már van aktív előfizetés → irány a Premium
      window.location.href = "/premium";
      return;
    }

    // 2️⃣ Nincs prémium → Stripe
    localStorage.setItem("userFinancials", JSON.stringify(data));

    try {
      const response = await fetch("/api/create-stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const session = await response.json();

      if (session.url) {
        window.location.href = session.url;
      } else {
        alert("Payment initialization failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error during checkout.");
    }
  };

  /* ===== STYLES ===== */

  const cardStyle = {
    background: "rgba(15, 23, 42, 0.55)",
    backdropFilter: "blur(14px)",
    borderRadius: "22px",
    padding: "26px",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "white",
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.08)",
    border: "none",
    borderRadius: "8px",
    padding: "10px",
    color: "white",
    width: "100%",
    marginTop: "5px",
  };

  const pricingCardStyle = {
    ...cardStyle,
    background: "rgba(10, 18, 35, 0.85)",
    border: "1px solid rgba(255,255,255,0.12)",
    textAlign: "center",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
        color: "white",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('/wealthyai/icons/hat.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "30px" }}>
          Your Financial Overview (Basic)
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* INPUTS */}
          <div style={cardStyle}>
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
                  style={inputStyle}
                  onChange={(e) =>
                    setData({ ...data, [key]: Number(e.target.value) })
                  }
                />
              </div>
            ))}

            <hr style={{ margin: "20px 0", opacity: 0.25 }} />

            <h4>Utilities (optional)</h4>
            {["electricity", "water", "gas", "internet"].map((key) => (
              <input
                key={key}
                type="number"
                placeholder={key}
                value={data[key]}
                style={inputStyle}
                onChange={(e) =>
                  setData({ ...data, [key]: Number(e.target.value) })
                }
              />
            ))}

            <label style={{ marginTop: "10px", display: "block" }}>
              Subscriptions
            </label>
            <input
              type="number"
              value={data.subscriptions}
              style={inputStyle}
              onChange={(e) =>
                setData({ ...data, subscriptions: Number(e.target.value) })
              }
            />
          </div>

          {/* INSIGHTS */}
          <div style={cardStyle}>
            <h3>Insights (Basic)</h3>
            <p>
              Risk Level: <strong>{riskLevel}</strong>
            </p>
            <p>
              Savings Score: <strong>{savingsScore}/100</strong>
            </p>

            <ul>
              {insights.map((i, idx) => (
                <li key={idx} style={{ marginBottom: "12px" }}>
                  {i}
                </li>
              ))}
            </ul>

            <p style={{ opacity: 0.65, marginTop: "18px" }}>
              Advanced country-specific strategies and AI optimization are
              available below.
            </p>
          </div>
        </div>

        {/* PRICING */}
        <div style={{ marginTop: "60px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
            Unlock Advanced AI Optimization
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            {[
              [
                "1 Day Pass",
                "AI optimization & crisis insights",
                "price_1SscYJDyLtejYlZiyDvhdaIx",
              ],
              [
                "1 Week Pass",
                "Behavior & trend analysis",
                "price_1SscaYDyLtejYlZiDjSeF5Wm",
              ],
              [
                "1 Month Pass",
                "Full AI financial dashboard",
                "price_1SscbeDyLtejYlZixJcT3B4o",
              ],
            ].map(([title, desc, priceId]) => (
              <div
                key={title}
                style={pricingCardStyle}
                onClick={() => handleCheckout(priceId)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 0 30px rgba(80,160,255,0.25)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow = "none")
                }
              >
                <h3>{title}</h3>
                <small style={{ opacity: 0.8 }}>{desc}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
