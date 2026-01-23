// pages/start.js
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// ✅ PUBLISHABLE KEY ENV-BŐL (TEST vagy LIVE – amit Vercelen beállítasz)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function UserDashboard() {
  const [data, setData] = useState({
    income: 5000,
    fixed: 2000,
    variable: 1500,
  });

  const totalExpenses = data.fixed + data.variable;
  const balance = data.income - totalExpenses;
  const usagePercent = Math.min(
    (totalExpenses / data.income) * 100,
    100
  );

  // ✅ STRIPE CHECKOUT
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
        console.error(session.error);
        alert('Hiba történt a fizetés indításakor.');
      }
    } catch (err) {
      console.error(err);
      alert('Stripe kapcsolat hiba.');
    }
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '25px',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    marginBottom: '20px',
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
    transition: 'transform 0.2s',
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
          }}
        >
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
                color: balance < 0 ? '#ff4d4d' : '#00ff88',
                fontSize: '2.5rem',
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
                marginTop: '15px',
              }}
            >
              <div
                style={{
                  width: `${usagePercent}%`,
                  height: '100%',
                  background:
                    usagePercent > 90 ? '#ff4d4d' : '#00ff88',
                }}
              />
            </div>

            <p style={{ marginTop: '20px', opacity: 0.8 }}>
              💡 Try to keep expenses under 80% to save more.
            </p>

            <a
              href="/"
              style={{
                display: 'inline-block',
                marginTop: '20px',
                color: 'white',
                opacity: 0.8,
              }}
            >
              ← Back to Home
            </a>
          </div>
        </div>

        {/* PREMIUM */}
        <div style={{ marginTop: '60px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
