// pages/start.js
import React, { useState } from 'react';

export default function UserDashboard() {
  const [data, setData] = useState({
    income: 5000,
    fixed: 2000,
    variable: 1500,
  });

  const totalExpenses = data.fixed + data.variable;
  const balance = data.income - totalExpenses;
  const usagePercent =
    data.income > 0 ? Math.min((totalExpenses / data.income) * 100, 100) : 0;

  const handleCheckout = async (priceId) => {
    try {
      const response = await fetch('/api/create-stripe-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const session = await response.json();

      if (session.url) {
        window.location.href = session.url;
      } else {
        alert('Payment initialization failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Unexpected error during checkout.');
    }
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '25px',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '8px',
    padding: '10px',
    color: 'white',
    width: '100%',
    marginTop: '5px',
  };

  const pricingCardStyle = {
    ...cardStyle,
    background: 'rgba(0,255,136,0.08)',
    border: '1px solid rgba(0,255,136,0.3)',
    textAlign: 'center',
    cursor: 'pointer',
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#060b13',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        padding: '40px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px' }}>
          Your Financial Overview (Basic)
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* INPUTS */}
          <div style={cardStyle}>
            <h3>Enter Your Data</h3>

            <label>Monthly Income ($)</label>
            <input
              type="number"
              value={data.income}
              style={inputStyle}
              onChange={(e) =>
                setData({ ...data, income: Number(e.target.value) })
              }
            />

            <label style={{ marginTop: '10px', display: 'block' }}>
              Fixed Expenses
            </label>
            <input
              type="number"
              value={data.fixed}
              style={inputStyle}
              onChange={(e) =>
                setData({ ...data, fixed: Number(e.target.value) })
              }
            />

            <label style={{ marginTop: '10px', display: 'block' }}>
              Variable Expenses
            </label>
            <input
              type="number"
              value={data.variable}
              style={inputStyle}
              onChange={(e) =>
                setData({ ...data, variable: Number(e.target.value) })
              }
            />
          </div>

          {/* RESULTS */}
          <div style={cardStyle}>
            <h3>Balance & Insights</h3>
            <h2
              style={{
                fontSize: '2.4rem',
                color: balance < 0 ? '#ff4d4d' : '#00ff88',
              }}
            >
              {balance.toLocaleString()} $
            </h2>

            <p>You are spending {usagePercent.toFixed(1)}% of your income.</p>

            <div
              style={{
                width: '100%',
                height: '12px',
                background: '#333',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${usagePercent}%`,
                  height: '100%',
                  background: usagePercent > 90 ? '#ff4d4d' : '#00ff88',
                }}
              />
            </div>

            <p style={{ marginTop: '15px', opacity: 0.8 }}>
              💡 Try to keep expenses below 80% to maintain savings.
            </p>
          </div>
        </div>

        {/* PREMIUM */}
        <div style={{ marginTop: '60px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
            Unlock Advanced AI Optimization
          </h2>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={pricingCardStyle}
              onClick={() => handleCheckout('price_1TESTDAY...')}
            >
              <h3>1 Day Pass</h3>
              <p style={{ fontSize: '2rem' }}>$9.99</p>
              <p>Advanced AI analysis & exports</p>
            </div>

            <div
              style={pricingCardStyle}
              onClick={() => handleCheckout('price_1TESTWEEK...')}
            >
              <h3>1 Week Pass</h3>
              <p style={{ fontSize: '2rem' }}>$14.99</p>
              <p>Goal tracking & summaries</p>
            </div>

            <div
              style={pricingCardStyle}
              onClick={() => handleCheckout('price_1TESTMONTH...')}
            >
              <h3>1 Month Pass</h3>
              <p style={{ fontSize: '2rem' }}>$24.99</p>
              <p>Live charts & tax tools</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
