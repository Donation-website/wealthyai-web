import React, { useState } from 'react';

export default function UserDashboard() {
  const [data, setData] = useState({
    income: 5000,
    fixed: 2000,
    variable: 1500,
  });
  // Új állapot az AI válaszának tárolására és a töltés jelzésére
  const [aiInsight, setAiInsight] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);


  const totalExpenses = data.fixed + data.variable;
  const balance = data.income - totalExpenses;
  const usagePercent =
    data.income > 0 ? Math.min((totalExpenses / data.income) * 100, 100) : 0;

  const handleCheckout = async (priceId) => {
    localStorage.setItem('userFinancials', JSON.stringify(data));

    try {
      const response = await fetch('/api/create-stripe-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      // ... (rest of stripe logic)
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
  
  // Új funkció az AI hívására
  const getFreeAIInsight = async () => {
    setLoadingAI(true);
    // Feltételezve, hogy az /api/get-ai-insight.js fájlod már az új router.huggingface.co URL-t használja
    const response = await fetch('/api/get-ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), // Elküldjük a bevételi adatokat
    });
    const result = await response.json();
    setAiInsight(result.insight);
    setLoadingAI(false);
  };


  // Stílusok meghagyva
  const cardStyle = { /* ... */ };
  const inputStyle = { /* ... */ };
  const pricingCardStyle = { /* ... */ };


  return (
    <main style={{ minHeight: '100vh', background: '#060b13', color: 'white', fontFamily: 'Arial, sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px' }}>Your Financial Overview (Basic)</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={cardStyle}>
            <h3>Enter Your Data</h3>
            <label>Monthly Income ($)</label>
            <input type="number" value={data.income} style={inputStyle} onChange={(e) => setData({ ...data, income: Number(e.target.value) })} />
            <label style={{ marginTop: '10px', display: 'block' }}>Fixed Expenses</label>
            <input type="number" value={data.fixed} style={inputStyle} onChange={(e) => setData({ ...data, fixed: Number(e.target.value) })} />
            <label style={{ marginTop: '10px', display: 'block' }}>Variable Expenses</label>
            <input type="number" value={data.variable} style={inputStyle} onChange={(e) => setData({ ...data, variable: Number(e.target.value) })} />
          </div>

          <div style={cardStyle}>
            <h3>Balance & Insights</h3>
            <h2 style={{ fontSize: '2.4rem', color: balance < 0 ? '#ff4d4d' : '#00ff88' }}>{balance.toLocaleString()} $</h2>
            <p>You are spending {usagePercent.toFixed(1)}% of your income.</p>
            <div style={{ width: '100%', height: '12px', background: '#333', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${usagePercent}%`, height: '100%', background: usagePercent > 90 ? '#ff4d4d' : '#00ff88' }} />
            </div>
            
            {/* ÚJ RÉSZ AZ INGYENES AI GOMBBAL ÉS EREDMÉNNYEL */}
            <button 
                onClick={getFreeAIInsight} 
                disabled={loadingAI}
                style={{ marginTop: '20px', padding: '10px', cursor: 'pointer', backgroundColor: '#00ff88', color: '#060b13', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
            >
                {loadingAI ? 'ANALYZING...' : 'Get Free AI Insight'}
            </button>

            {aiInsight && (
                <div style={{ marginTop: '15px', opacity: 0.9, whiteSpace: 'pre-line', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                    {aiInsight}
                </div>
            )}
            
          </div>
        </div>

        {/* ... (rest of pricing section) ... */}
        <div style={{ marginTop: '60px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Unlock Advanced AI Optimization (Stripe)</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={pricingCardStyle} onClick={() => handleCheckout('price_1SscYJDyLtejYlZiyDvhdaIx')}>
              <h3>1 Day Pass</h3>
              <p style={{ fontSize: '2rem' }}>$9.99</p>
            </div>
            <div style={pricingCardStyle} onClick={() => handleCheckout('price_1SscaYDyLtejYlZiDjSeF5Wm')}>
              <h3>1 Week Pass</h3>
              <p style={{ fontSize: '2rem' }}>$14.99</p>
            </div>
            <div style={pricingCardStyle} onClick={() => handleCheckout('price_1SscbeDyLtejYlZixJcT3B4o')}>
              <h3>1 Month Pass</h3>
              <p style={{ fontSize: '2rem' }}>$24.99</p>
            </div>
          </div>
        </div>


      </div>
    </main>
  );
}
