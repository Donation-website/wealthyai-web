import React, { useState } from 'react';

export default function UserDashboard() {
  const [data, setData] = useState({
    income: 5000,
    fixed: 2000,
    variable: 1500,
    electricity: 150,
    water: 50,
    gas: 100,
    internet: 60,
    phone: 40,
  });

  const totalExpenses =
    data.fixed +
    data.variable +
    data.electricity +
    data.water +
    data.gas +
    data.internet +
    data.phone;

  const balance = data.income - totalExpenses;
  const usagePercent =
    data.income > 0 ? Math.min((totalExpenses / data.income) * 100, 100) : 0;

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
    marginBottom: '10px',
  };

  const warningStyle = {
    marginTop: '15px',
    padding: '15px',
    borderRadius: '12px',
    background:
      balance < 0
        ? 'rgba(255, 80, 80, 0.15)'
        : 'rgba(0, 255, 136, 0.12)',
    border:
      balance < 0
        ? '1px solid rgba(255,80,80,0.4)'
        : '1px solid rgba(0,255,136,0.4)',
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
            <h3>Income & Expenses</h3>

            <label>Monthly Income ($)</label>
            <input
              type="number"
              value={data.income}
              style={inputStyle}
              onChange={(e) =>
                setData({ ...data, income: Number(e.target.value) })
              }
            />

            <label>Fixed Expenses</label>
            <input
              type="number"
              value={data.fixed}
              style={inputStyle}
              onChange={(e) =>
                setData({ ...data, fixed: Number(e.target.value) })
              }
            />

            <label>Variable Expenses</label>
            <input
              type="number"
              value={data.variable}
              style={inputStyle}
              onChange={(e) =>
                setData({ ...data, variable: Number(e.target.value) })
              }
            />

            <hr style={{ opacity: 0.2 }} />

            {[
              ['electricity', 'Electricity'],
              ['water', 'Water'],
              ['gas', 'Gas'],
              ['internet', 'Internet'],
              ['phone', 'Phone'],
            ].map(([key, label]) => (
              <div key={key}>
                <label>{label}</label>
                <input
                  type="number"
                  value={data[key]}
                  style={inputStyle}
                  onChange={(e) =>
                    setData({
                      ...data,
                      [key]: Number(e.target.value),
                    })
                  }
                />
              </div>
            ))}
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
                marginTop: '10px',
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

            <div style={warningStyle}>
              {balance < 0 ? (
                <>
                  <strong>⚠ Financial Alert</strong>
                  <p style={{ marginTop: '8px', opacity: 0.85 }}>
                    Your expenses exceed your income.
                    <br />
                    AI Premium provides emergency strategies, local support
                    options, and recovery planning.
                  </p>
                </>
              ) : (
                <>
                  <strong>✅ Healthy Status</strong>
                  <p style={{ marginTop: '8px', opacity: 0.85 }}>
                    You are on track. Premium AI can help optimize savings
                    and long-term growth.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <p
          style={{
            marginTop: '40px',
            textAlign: 'center',
            opacity: 0.65,
          }}
        >
          🔒 Country-specific savings, providers & advanced strategies are
          available in Premium plans below.
        </p>
      </div>
    </main>
  );
}
