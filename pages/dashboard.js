
import React, { useState } from 'react';

// Ez lesz az a komponens, amit a Start gomb utáni oldalon használsz.

export default function UserDashboard() {
  const [data, setData] = useState({ income: 5000, fixed: 2000, variable: 1500 });

  const totalExpenses = data.fixed + data.variable;
  const balance = data.income - totalExpenses;
  const usagePercent = Math.min((totalExpenses / data.income) * 100, 100);

  // Kártya stílus a glassmorphism designhoz igazítva
  const cardStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "25px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "white",
    marginBottom: "20px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
  };

  const inputStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    border: "none",
    borderRadius: "8px",
    padding: "10px",
    color: "white",
    width: "100%",
    marginTop: "5px",
    // Placeholder színének beállítása, ha szükséges
    '::placeholder': { color: 'rgba(255, 255, 255, 0.7)' }
  };

  const pricingCardStyle = {
    ...cardStyle,
    background: "rgba(0, 255, 136, 0.08)", // Enyhe zöldes árnyalat a kiemeléshez
    border: "1px solid rgba(0, 255, 136, 0.3)",
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "white", marginBottom: "30px" }}>Your Financial Overview (Basic)</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* INPUT SECTION (FREE TIER) */}
        <div style={cardStyle}>
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

        {/* RESULTS SECTION (FREE TIER) */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Balance & Insights</h3>
          <h2 style={{ fontSize: "2.5rem", margin: "10px 0", color: balance < 0 ? "#ff4d4d" : "#00ff88" }}>
            {balance.toLocaleString()} $
          </h2>
          <p style={{ opacity: 0.7 }}>You are spending {usagePercent.toFixed(1)}% of your income.</p>
          
          {/* Progress Bar */}
          <div style={{ width: "100%", background: "#333", height: "12px", borderRadius: "10px", marginTop: "20px", overflow: "hidden" }}>
            <div style={{ width: `${usagePercent}%`, background: usagePercent > 90 ? "#ff4d4d" : "#00ff88", height: "100%", transition: "0.3s" }} />
          </div>

          <p style={{ color: "rgba(255,255,255,0.7)", marginTop: "20px" }}>
            💡 Basic Insight: Try to keep your total expenses below 80% for healthy savings rate.
          </p>
        </div>
      </div>
      
      {/* PREMIUM UPSELL SECTION */}
      <div style={{ marginTop: "60px" }}>
        <h2 style={{ color: "white", textAlign: "center", marginBottom: "30px" }}>Unlock Advanced AI Optimization & Visuals</h2>
        
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          
          {/* 1 Day Pass - Kiemelve */}
          <div style={{...pricingCardStyle, transform: 'scale(1.05)'}}>
            <h3>1 Day Pass</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>$9.99</p>
            <p>Full AI Analysis, Detailed PDF Export, Advanced Projections.</p>
            <button style={{ padding: "10px 20px", background: "#00ff88", border: "none", borderRadius: "5px", marginTop: "15px", fontWeight: "bold" }}>
              Get Instant Access
            </button>
          </div>

          {/* 1 Week Pass */}
          <div style={pricingCardStyle}>
            <h3>1 Week Pass</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>$14.99</p>
            <p>Everything in 1 Day, plus Goal Tracking & Weekly Digests.</p>
            <button style={{ padding: "10px 20px", background: "#444", color: "white", border: "none", borderRadius: "5px", marginTop: "15px" }}>
              Subscribe
            </button>
          </div>

          {/* 1 Month Pass */}
          <div style={pricingCardStyle}>
            <h3>1 Month Pass</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>$24.99</p>
            <p>Everything in 1 Week, plus Tax Optimization Tools & Live Charts.</p>
            <button style={{ padding: "10px 20px", background: "#444", color: "white", border: "none", borderRadius: "5px", marginTop: "15px" }}>
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
