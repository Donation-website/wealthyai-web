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

  const handleCheckout = async (priceId, tier) => {
    localStorage.setItem("userFinancials", JSON.stringify(data));

    try {
      const res = await fetch("/api/create-stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, tier }),
      });

      const session = await res.json();
      if (session.url) window.location.href = session.url;
      else alert("Payment initialization failed");
    } catch {
      alert("Unexpected error during checkout");
    }
  };

  return (
    <main>
      <h1>Basic Dashboard</h1>

      <button onClick={() => handleCheckout("price_DAY_ID", "day")}>
        1 Day Pass
      </button>

      <button onClick={() => handleCheckout("price_WEEK_ID", "week")}>
        1 Week Pass
      </button>

      <button onClick={() => handleCheckout("price_MONTH_ID", "month")}>
        1 Month Pass
      </button>
    </main>
  );
}
