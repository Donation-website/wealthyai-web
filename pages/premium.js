import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PremiumDashboard() {
  const router = useRouter();
  const { session_id } = router.query;

  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!session_id) return;

    const verify = async () => {
      try {
        const res = await fetch(`/api/verify-session?session_id=${session_id}`);
        const data = await res.json();

        if (!data.valid) {
          setExpired(true);
          setLoading(false);
          return;
        }

        // 🔑 EZ HIÁNYZOTT EDDIG
        const access = {
          tier: data.tier,
          expiresAt: data.expiresAt,
        };

        localStorage.setItem('premiumAccess', JSON.stringify(access));
        setTier(data.tier);
        setLoading(false);

      } catch (err) {
        console.error(err);
        setExpired(true);
        setLoading(false);
      }
    };

    verify();
  }, [session_id]);

  if (loading) {
    return <div style={center}>Activating premium access…</div>;
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
