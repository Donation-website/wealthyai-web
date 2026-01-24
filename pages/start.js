import React, { useState } from "react";

export default function UserDashboard() {
  const [data, setData] = useState({
    income: 5000,
    fixed: 2000,
    variable: 1500,
  });

  const handleCheckout = async (priceId, tier) => {
    localStorage.setItem("userFinancials", JSON.stringify(data));

    try {
      const response = await fetch("/api/create-stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          tier, // ⬅️ EZ HIÁNYZOTT EDDIG
        }),
      });

      const session = await response.json();

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
        background: "#020617",
        color: "white",
        padding: "40px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <h1>Basic Dashboard</h1>

      <div style={{ display: "flex", gap: "20px", marginTop: "40px" }}>
        <button
          onClick={() =>
            handleCheckout(
              "price_1SscYJDyLtejYlZiyDvhdaIx",
              "day"
            )
          }
        >
          1 Day Pass
        </button>

        <button
          onClick={() =>
            handleCheckout(
              "price_1SscaYDyLtejYlZiDjSeF5Wm",
              "premium-week"
            )
          }
        >
          1 Week Pass
        </button>

        <button
          onClick={() =>
            handleCheckout(
              "price_1SscbeDyLtejYlZixJcT3B4o",
              "premium-month"
            )
          }
        >
          1 Month Pass
        </button>
      </div>
    </main>
  );
}
