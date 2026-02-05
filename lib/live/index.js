import { useState } from "react";

export default function LiveLanding() {
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/live/create-session", {
        method: "POST",
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout failed.");
        setLoading(false);
      }
    } catch (e) {
      alert("Checkout failed.");
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 520 }}>
        <h1 style={{ fontSize: "2rem", marginBottom: 16 }}>
          Live Financial Environment
        </h1>

        <p style={{ opacity: 0.85, marginBottom: 20 }}>
          Real-time interpretation of the financial environment.
          <br />
          No advice. No alerts. No noise.
        </p>

        <ul style={{ opacity: 0.7, marginBottom: 24 }}>
          <li>Global financial context</li>
          <li>Region-aware interpretation</li>
          <li>Updates only when meaning changes</li>
        </ul>

        <button
          onClick={startCheckout}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            fontSize: "16px",
            borderRadius: 10,
            border: "none",
            background: "#38bdf8",
            color: "#020617",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Redirecting…" : "Unlock 30 days · €29.99"}
        </button>

        <p style={{ marginTop: 14, fontSize: 12, opacity: 0.5 }}>
          Not financial advice. Informational context only.
        </p>
      </div>
    </main>
  );
}
