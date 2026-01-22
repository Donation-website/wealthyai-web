import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PremiumPage() {
  const router = useRouter();
  const { session_id } = router.query;
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!session_id) return;

    fetch(`/api/verify-session?session_id=${session_id}`)
      .then(res => res.json())
      .then(data => {
        setValid(data.valid);
        setLoading(false);
      });
  }, [session_id]);

  if (loading) {
    return (
      <main style={pageStyle}>
        <h2>Verifying your payment…</h2>
      </main>
    );
  }

  if (!valid) {
    router.push('/start');
    return null;
  }

  return (
    <main style={pageStyle}>
      <h1>🎉 Welcome to WealthyAI Premium</h1>
      <p style={{ maxWidth: "600px", opacity: 0.85 }}>
        Thank you for choosing WealthyAI.
        Your payment was successful and your premium access is now active.
      </p>

      <div style={cardStyle}>
        <h3>What’s next?</h3>
        <ul>
          <li>✔ Advanced AI financial optimization</li>
          <li>✔ Interactive charts & projections</li>
          <li>✔ Goal tracking & exports</li>
        </ul>
      </div>

      <p style={{ marginTop: "30px", opacity: 0.7 }}>
        🚀 AI features coming online shortly.
      </p>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#060b13",
  color: "white",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px",
  fontFamily: "Arial, sans-serif",
  textAlign: "center"
};

const cardStyle = {
  marginTop: "30px",
  padding: "25px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.15)"
};
