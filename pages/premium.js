import { useEffect, useState } from 'react';

export default function PremiumDashboard() {
  const [tier, setTier] = useState(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const access = JSON.parse(localStorage.getItem('premiumAccess'));
    if (!access) {
      setExpired(true);
      return;
    }
    if (Date.now() > access.expiresAt) {
      setExpired(true);
      localStorage.removeItem('premiumAccess');
    } else {
      setTier(access.tier);
    }
  }, []);

  if (expired) {
    return (
      <div style={center}>
        <h2>Access expired</h2>
        <a href="/start">Renew access</a>
      </div>
    );
  }

  if (!tier) {
    return <div style={center}>Loading premium…</div>;
  }

  return (
    <div style={{ padding: 40, color: 'white', background: '#020617', minHeight: '100vh' }}>
      <h1>WealthyAI Premium</h1>

      {tier === 'day' && <p>✅ 1 Day Pro Strategy Access</p>}
      {tier === 'week' && <p>🚀 7 Day Behavioral + Trend Analysis</p>}
      {tier === 'month' && <p>👑 Full AI Wealth Engine + Tax Simulation</p>}

      <p style={{ marginTop: 20, opacity: 0.7 }}>
        Tier: <strong>{tier.toUpperCase()}</strong>
      </p>
    </div>
  );
}

const center = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  flexDirection: 'column',
};
