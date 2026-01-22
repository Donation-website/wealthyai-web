// pages/start.js (Teljes kód csere)
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Töltsd be a publikus kulcsodat (a Vercelből jön NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY névvel)
// Jelenleg a kódba van írva a megadott kulcs
const stripePromise = loadStripe('pk_live_51S0zyXDyLtejYlZibrRjTKEHsMWqtJh1WpENv2SeEc0m3KXH9yv1tdPKevrkvVgSzIYfBcukep1fo50KVn5AYp3n000F6g1N2u');

export default function UserDashboard() {
  const [data, setData] = useState({ income: 5000, fixed: 2000, variable: 1500 });
  // ... (a többi useState és számítási logika marad, lásd az előző kódot) ...
  const totalExpenses = data.fixed + data.variable;
  const balance = data.income - totalExpenses;
  const usagePercent = Math.min((totalExpenses / data.income) * 100, 100);


  // *** ÚJ FUNKCIÓ: Stripe Checkout kezelése ***
  const handleCheckout = async (priceId) => {
    // 1. Az API Route hívása, ami létrehozza a Stripe Session-t
    const response = await fetch('/api/create-stripe-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    });

    const session = await response.json();

    // 2. Átirányítás a Stripe fizetési oldalára
    if (session.url) {
      window.location.href = session.url;
    } else {
      console.error(session.error);
      alert("Hiba történt a fizetés indításakor.");
    }
  };

  // ... (a cardStyle, inputStyle, pricingCardStyle definíciók maradnak) ...
  const cardStyle = { /* ... */ background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(10px)", borderRadius: "20px", padding: "25px", border: "1px solid rgba(255, 255, 255, 0.1)", color: "white", marginBottom: "20px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)" };
  const inputStyle = { /* ... */ background: "rgba(255, 255, 255, 0.1)", border: "none", borderRadius: "8px", padding: "10px", color: "white", width: "100%", marginTop: "5px" };
  const pricingCardStyle = { /* ... */ ...cardStyle, background: "rgba(0, 255, 136, 0.08)", border: "1px solid rgba(0, 255, 136, 0.3)", textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' };


  return (
    <main style={{ minHeight: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#060b13", color: "white", fontFamily: "Arial, sans-serif", padding: "40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {/* ... (Az ingyenes kalkulátor UI része marad változatlan) ... */}
            <h1 style={{ color: "white", marginBottom: "30px" }}>Your Financial Overview (Basic)</h1>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* INPUT SECTION */}
                <div style={cardStyle}> {/* ... input fields ... */}
                <h3 style={{ marginTop: 0 }}>Enter Your Data</h3>
                <div style={{ marginBottom: "15px" }}>
                    <label>Monthly Income ($)</label>
                    <input type="number" value={data.income} style={inputStyle} 
                    onChange={(e) => setData({...data, income: Number(e.target.value)})} />
                </div>
                <div style={{ marginBottom: "15px" }}>
                    <label>Fixed Expenses (Rent, Bills)</label>
                    <input type="number" value={data.fixed} style={inputStyle}
                    onChange={(e) => setData({...data, fixed: Number(e.target.value)})} />
                </div>
                <div style={{ marginBottom: "15px" }}>
                    <label>Variable (Food, Fun)</label>
                    <input type="number" value={data.variable} style={inputStyle}
                    onChange={(e) => setData({...data, variable: Number(e.target.value)})} />
                </div>
                </div>

                {/* RESULTS SECTION */}
                <div style={cardStyle}>
                <h3 style={{ marginTop: 0 }}>Balance & Insights</h3>
                <h2 style={{ fontSize: "2.5rem", margin: "10px 0", color: balance < 0 ? "#ff4d4d" : "#00ff88" }}>
                    {balance.toLocaleString()} $
                </h2>
                <p style={{ opacity: 0.7 }}>You are spending {usagePercent.toFixed(1)}% of your income.</p>
                
                <div style={{ width: "100%", background: "#333", height: "12px", borderRadius: "10px", marginTop: "20px", overflow: "hidden" }}>
                    <div style={{ width: `${usagePercent}%`, background: usagePercent > 90 ? "#ff4d4d" : "#00ff88", height: "100%", transition: "0.3s" }} />
                </div>

                <p style={{ color: "rgba(255,255,255,0.7)", marginTop: "20px" }}>
                    💡 Basic Insight: Try to keep your total expenses below 80% for healthy savings rate.
                </p>
                <div style={{ marginTop: "30px", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "20px" }}>
                    <a href="/" style={{ color: "white", textDecoration: "underline", opacity: 0.8, fontSize: "0.9rem" }}>
                        ← Back to Home
                    </a>
                </div>
                </div>
            </div>
            
            {/* PREMIUM UPSELL SECTION - Gombok kattinthatóvá téve */}
            <div style={{ marginTop: "60px" }}>
                <h2 style={{ color: "white", textAlign: "center", marginBottom: "30px" }}>Unlock Advanced AI Optimization & Visuals</h2>
                
                <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                
                {/* 1 Day Pass - Kiemelve, handleCheckout hívása */}
                <div style={{...pricingCardStyle, transform: 'scale(1.05)'}} onClick={() => handleCheckout('price_1SsRVyDyLtejYlZi3fEwvTPW')}>
                    <h3>1 Day Pass</h3>
                    <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>$9.99</p>
                    <p>Full AI Analysis, Detailed PDF Export, Advanced Projections.</p>
                    <button style={{ padding: "10px 20px", background: "#00ff88", border: "none", borderRadius: "5px", marginTop: "15px", fontWeight: "bold", cursor: 'pointer' }}>
                    Get Instant Access
                    </button>
                </div>

                {/* 1 Week Pass, handleCheckout hívása */}
                <div style={pricingCardStyle} onClick={() => handleCheckout('price_1SsRY1DyLtejYlZiglvFKufA')}>
                    <h3>1 Week Pass</h3>
                    <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>$14.99</p>
                    <p>Everything in 1 Day, plus Goal Tracking & Weekly Digests.</p>
                    <button style={{ padding: "10px 20px", background: "#444", color: "white", border: "none", borderRadius: "5px", marginTop: "15px", cursor: 'pointer' }}>
                    Subscribe
                    </button>
                </div>

                {/* 1 Month Pass, handleCheckout hívása */}
                <div style={pricingCardStyle} onClick={() => handleCheckout('price_1SsRceDyLtejYlZim22g8OT2')}>
                    <h3>1 Month Pass</h3>
                    <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>$24.99</p>
                    <p>Everything in 1 Week, plus Tax Optimization Tools & Live Charts.</p>
                    <button style={{ padding: "10px 20px", background: "#444", color: "white", border: "none", borderRadius: "5px", marginTop: "15px", cursor: 'pointer' }}>
                    Subscribe
                    </button>
                </div>
                </div>
            </div>
        </div>
    </main>
  );
}
