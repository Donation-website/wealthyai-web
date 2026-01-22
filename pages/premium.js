import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function PremiumPage() {
  const router = useRouter();
  const { session_id } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session_id) {
      // Később itt jön majd a Stripe server-side ellenőrzés
      setLoading(false);
    }
  }, [session_id]);

  if (loading) {
    return (
      <main style={pageStyle}>
        <h2>Verifying your payment...</h2>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ color: "#00ff88" }}>✅ Payment Successful</h1>
        <p style={{ marginTop: "10px", opacity: 0.85 }}>
          Thank you for choosing <strong>WealthyAI</strong>.
        </p>

        <p style={{ marginTop: "20px", opacity: 0.75 }}>
          Your premium features are now unlocked.
        </p>

        <button
          style={buttonStyle}
          onClick={() => alert("AI + charts will load here next 🚀")}
        >
          Launch Premium Dashboard
        </button>

        <p style={{ marginTop: "30px", fontSize: "0.85rem", opacity: 0.6 }}>
          A confirmation email has been sent.
        </p>
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#060b13",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  background: "rgba(255,255,255,0.06)",
  borderRadius: "20px",
  padding: "40px",
  textAlign: "center",
  maxWidth: "480px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
};

const buttonStyle = {
  marginTop: "30px",
  padding: "14px 28px",
  background: "#00ff88",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
};
