import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PremiumDashboard() {
  const router = useRouter();
  const { session_id } = router.query;

  const [tier, setTier] = useState(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session_id) {
      setExpired(true);
      setLoading(false);
      return;
    }

    fetch(`/api/verify-session?session_id=${session_id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.valid) {
          setExpired(true);
          return;
        }

        const access = {
          tier: data.tier,
          expiresAt: data.expiresAt,
        };

        localStorage.setItem('premiumAccess', JSON.stringify(access));
        setTier(data.tier);
      })
      .catch(() => setExpired(true))
      .finally(() => setLoading(false));
  }, [session_id]);

  if (loading) {
    return <div style={center}>Verifying payment…</div>;
  }

  if (expired) {
    return (
      <div style={center}>
        <h2>Access expired</h2>
        <a href="/start">Renew access</a>
      </div>
    );
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
