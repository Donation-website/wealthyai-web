import React, { useState } from 'react';

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

  const totalUtilities =
    data.electricity + data.water + data.gas + data.internet;

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
      ? 'High Risk'
      : usagePercent > 70
      ? 'Medium Risk'
      : 'Low Risk';

  const insights = [];

  if (balance < 0) {
    insights.push(
      '🚨 Critical warning: Your expenses exceed your income. This situation is not sustainable long-term.'
    );
    insights.push(
      '🔒 In AI mode, you will receive step-by-step crisis strategies, including cost restructuring and available support options.'
    );
  } else {
    if (data.subscriptions > data.income * 0.08) {
      insights.push(
        '📺 Your subscriptions are relatively high. Reviewing unused services could reduce monthly costs.'
      );
    }

    if (totalUtilities > data.income * 0.15) {
      insights.push(
        '⚡ Utilities take up a significant portion of your income. Energy or internet plans may be optimized.'
      );
    }

    if (savingsRate >= 20) {
      insights.push(
        '✅ Your savings rate is healthy. This structure supports long-term stability.'
      );
    } else {
      insights.push(
        '⚠️ Increasing your savings toward 20% would improve financial resilience.'
      );
    }
  }

  const handleCheckout = async (priceId) => {
    localStorage.setItem('userFinancials', JSON.stringify(data));

    try {
      const response = await fetch('/api/create-stripe-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const session = await response.json();
      if (session.url) window.location.href = session.url;
      else alert('Payment initialization failed.');
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
          }}
        >
          {/* LEFT */}
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

            <hr style={{ margin: '20px 0', opacity: 0.3 }} />

            <h4>Utilities (optional)</h4>
            {['electricity', 'water', 'gas', 'internet'].map((key) => (
              <input
                key={key}
                type="number"
                placeholder={key}
                value={data[key]}
                style={inputStyle}
                onChange={(e) =>
                  setData({ ...data, [k]()
