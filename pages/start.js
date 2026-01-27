import React, { useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

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

  const riskLevel =
    totalExpenses / data.income > 0.9
      ? "High Risk"
      : totalExpenses / data.income > 0.7
      ? "Medium Risk"
      : "Low Risk";

  /* ===== RADAR DATA ===== */

  const radarData = [
    { metric: "Income", value: data.income / 100 },
    { metric: "Fixed Costs", value: data.fixed / 100 },
    { metric: "Variable Costs", value: data.variable / 100 },
    { metric: "Subscriptions", value: data.subscriptions / 100 },
    {
      metric: "Utilities",
      value:
        (data.electricity +
          data.water +
          data.gas +
          data.internet) /
        100,
    },
    { metric: "Remaining", value: Math.max(balance, 0) / 100 },
  ];

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
    borderRadius: 22,
    padding: 26,
    border: "1px solid rgba(255,255,255,0.08)",
  };

  const input = {
    width: "100%",
    padding: 10,
    marginTop: 6,
    borderRadius: 8,
    border: "none",
    background: "rgba(255,255,255,0.08)",
    color: "white",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 40,
        color: "white",
        fontFamily: "Inter, system-ui",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/wealthyai/icons/hat.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      {/* LOGO */}
      <img
        src="/wealthyai/icons/generated.png"
        alt="WealthyAI"
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          width: 120,
          opacity: 0.75,
        }}
      />

      {/* HELP BUTTON */}
      <a
        href="/help/basic"
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          padding: "8px 14px",
          borderRadius: 10,
          fontSize: 13,
          textDecoration: "none",
          color: "#7dd3fc",
          border: "1px solid #1e293b",
          background: "rgba(2,6,23,0.6)",
          backdropFilter: "blur(6px)",
        }}
      >
        Help
      </a>

      {/* CENTER HEADER */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1>Your Financial Overview (Basic)</h1>
        <p style={{ opacity: 0.75 }}>
          This view shows a snapshot — not behavior, not direction.
        </p>
      </div>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
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

          <p style={{ marginTop: 20, opacity: 0.75 }}>
            Risk level: <strong>{riskLevel}</strong>
          </p>
        </div>

        {/* RADAR */}
        <div style={card}>
          <h3>Financial Structure (Snapshot)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis />
              <Radar
                dataKey="value"
                stroke="#38bdf8"
                fill="#38bdf8"
                fillOpacity={0.25}
              />
            </RadarChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 13, opacity: 0.65 }}>
            Relative distribution of financial components (scaled values).
          </p>
        </div>
      </div>

      {/* PRICING */}
      <div style={{ marginTop: 60, textAlign: "center" }}>
        <h2>Continue when you’re ready</h2>

        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={card}
            onClick={() =>
              handleCheckout("price_1SscYJDyLtejYlZiyDvhdaIx")
            }
          >
            <h3>1 Day · $9.99</h3>
            <small>Clarity & AI strategy</small>
          </div>

          <div
            style={card}
            onClick={() =>
              handleCheckout("price_1SscaYDyLtejYlZiDjSeF5Wm")
            }
          >
            <h3>1 Week · $14.99</h3>
            <small>Behavior & regional context</small>
          </div>

          <div
            style={card}
            onClick={() =>
              handleCheckout("price_1SscbeDyLtejYlZixJcT3B4o")
            }
          >
            <h3>1 Month · $24.99</h3>
            <small>Direction, projections & exports</small>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 20,
          fontSize: 12,
          opacity: 0.6,
        }}
      >
        © 2026 WealthyAI — All rights reserved.
      </div>
    </main>
  );
}
