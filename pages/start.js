import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Ügyelj rá, hogy ez a kulcs pk_live_ kezdetű legyen!
const stripePromise = loadStripe('pk_live_51S0zyXDyLtejYlZibrRjTKEHsMWqtJh1WpENv2SeEc0m3KXH9yv1tdPKevrkvVgSzIYfBcukep1fo50KVn5AYp3n000F6g1N2u');

export default function UserDashboard() {
  const [data, setData] = useState({ income: 5000, fixed: 2000, variable: 1500 });
  const totalExpenses = data.fixed + data.variable;
  const balance = data.income - totalExpenses;
  const usagePercent = Math.min((totalExpenses / data.income) * 100, 100);

  const handleCheckout = async (priceId) => {
    try {
      const response = await fetch('/api/create-stripe-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const session = await response.json();

      if (session.url) {
        // Ez a sor irányít át a Stripe-ra
        window.location.href = session.url;
      } else {
        // Ha nincs URL, kiírja a pontos hibaüzenetet, amit a backend küld
        alert("Szerver hiba: " + (session.error || "Ismeretlen hiba"));
        console.error("Session Error:", session);
      }
    } catch (err) {
      alert("Hálózati hiba: " + err.message);
    }
  };

  const cardStyle = { background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(10px)", borderRadius: "20px", padding: "25px", border: "1px solid rgba(255, 255, 255, 0.1)", color: "white", marginBottom: "20px" };
  const inputStyle = { background: "rgba(255, 255, 255, 0.1)", border: "none", borderRadius: "8px", padding: "10px", color: "white", width: "100%", marginTop: "5px" };
  const pricingCardStyle = { ...cardStyle, background: "rgba(0, 255, 136, 0.08)", border: "1px solid rgba(0, 255, 136, 0.3)", textAlign: 'center', cursor: 'pointer' };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#060b13", color: "white", padding: "40px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h1>Financial Overview</h1>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
          <div style={cardStyle}>
            <h3>Enter Data</h3>
            <input type="number" value={data.income} style={inputStyle} onChange={(e) => setData({...data, income: Number(e.target.value)})} />
          </div>
          <div style={cardStyle}>
            <h3>Balance</h3>
            <h2 style={{ color: "#00ff88" }}>{balance} $</h2>
          </div>
        </div>

        <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          {/* 1 NAPOS PASS */}
          <div style={pricingCardStyle} onClick={() => handleCheckout('price_1SsRVyDyLtejYlZi3fEwvTPW')}>
            <h3>1 Day Pass</h3>
            <p>$9.99</p>
            <button style={{ cursor: 'pointer' }}>Upgrade Now</button>
          </div>

          {/* 1 HETES PASS */}
          <div style={pricingCardStyle} onClick={() => handleCheckout('price_1SsRY1DyLtejYlZiglvFKufA')}>
            <h3>1 Week Pass</h3>
            <p>$14.99</p>
            <button style={{ cursor: 'pointer' }}>Upgrade Now</button>
          </div>

          {/* 1 HAVI PASS */}
          <div style={pricingCardStyle} onClick={() => handleCheckout('price_1SsRceDyLtejYlZim22g8OT2')}>
            <h3>1 Month Pass</h3>
            <p>$24.99</p>
            <button style={{ cursor: 'pointer' }}>Upgrade Now</button>
          </div>
        </div>
      </div>
    </main>
  );
}
