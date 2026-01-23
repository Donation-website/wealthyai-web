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
    data.electricity +
    data.water +
    data.gas +
    data.internet;

  const totalExpenses =
    data.fixed + data.variable;

  const balance = data.income - totalExpenses;

  const usagePercent =
    data.income > 0 ? Math.min((totalExpenses / data.income) * 100, 100) : 0;

  // OKOS BASIC LOGIKA
  const savingsRate = data.income > 0 ? (balance / data.income) * 100 : 0;
  const savingsScore = Math.max(0, Math.min(100, Math.round((savingsRate / 30) * 100)));

  const riskLevel =
    usagePercent > 90 ? 'High Risk'
    : usagePercent > 70 ? 'Medium Risk'
    : 'Low Risk';

  // DINAMIKUS BASIC INSIGHTOK
  const insights = [];

  if (data.subscriptions > data.income * 0.08) {
    insights.push('📺 Your subscriptions seem high. Reviewing unused services could save money.');
  }

  if (totalUtilities > data.income * 0.15) {
    insights.push('⚡ Utilities are a significant part of your expenses. Energy or internet plans may be optimized.');
  }

  if (savingsRate >= 20) {
    insights.push('✅ You are saving at a healthy rate. Keep this structure.');
  } else {
    insights.push('⚠️ Consider increasing your savings rate toward 20%.');
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
    <main style={{ minHeight: '100vh', background: '#060b13', color: 'white', fontFamily: 'Arial, sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px' }}>Your Financial Overview (Basic)</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={cardStyle}>
            <h3>Income & Expenses</h3>

            <label>Monthly Income ($)</label>
            <input type="number" value={data.income} style={inputStyle}
              onChange={(e) => setData({ ...data, income: Number(e.target.value) })} />

            <label style={{ marginTop: '10px', display: 'block' }}>Fixed Expenses</label>
            <input type="number" value={data.fixed} style={inputStyle}
              onChange={(e) => setData({ ...data, fixed: Number(e.target.value) })} />

            <label style={{ marginTop: '10px', display: 'block' }}>Variable Expenses</label>
            <input type="number" value={data.variable} style={inputStyle}
              onChange={(e) => setData({ ...data, variable: Number(e.target.value) })} />

            <hr style={{ margin: '20px 0', opacity: 0.3 }} />

            <h4>Utilities (optional)</h4>
            {['electricity','water','gas','internet'].map((key) => (
              <input key={key} type="number" placeholder={key}
                value={data[key]} style={inputStyle}
                onChange={(e) => setData({ ...data, [key]: Number(e.target.value) })} />
            ))}

            <label style={{ marginTop: '10px', display: 'block' }}>Subscriptions</label>
            <input type="number" value={data.subscriptions} style={inputStyle}
              onChange={(e) => setData({ ...data, subscriptions: Number(e.target.value) })} />
          </div>

          <div style={cardStyle}>
            <h3>Insights (Basic)</h3>
            <p>Risk Level: <strong>{riskLevel}</strong></p>
            <p>Savings Score: <strong>{savingsScore}/100</strong></p>

            <ul>
              {insights.map((i, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>{i}</li>
              ))}
            </ul>

            <p style={{ opacity: 0.7, marginTop: '10px' }}>
              🔒 Country-specific savings & provider analysis unlocked with AI
            </p>
          </div>
        </div>

        <div style={{ marginTop: '60px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Unlock Advanced AI Optimization</h2>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={pricingCardStyle} onClick={() => handleCheckout('price_1SscYJDyLtejYlZiyDvhdaIx')}>
              <h3>1 Day Pass</h3>
              <small>AI optimization & insights</small>
            </div>

            <div style={pricingCardStyle} onClick={() => handleCheckout('price_1SscaYDyLtejYlZiDjSeF5Wm')}>
              <h3>1 Week Pass</h3>
              <small>Behavior & trend analysis</small>
            </div>

            <div style={pricingCardStyle} onClick={() => handleCheckout('price_1SscbeDyLtejYlZixJcT3B4o')}>
              <h3>1 Month Pass</h3>
              <small>Full AI financial dashboard</small>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
