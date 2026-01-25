export default function HelpPage() {
  return (
    <div style={page}>
      <button onClick={() => window.history.back()} style={back}>
        ← Back
      </button>

      <h1 style={title}>How Weekly Financial Intelligence Works</h1>

      <p style={intro}>
        This page explains how to read and use your weekly insights in WealthyAI.
      </p>

      <div style={card}>
        <strong>Weekly Snapshot</strong><br />
        A factual summary of what happened this week.
      </div>

      <div style={card}>
        <strong>Behavior Signal</strong><br />
        A short label describing spending patterns — not judgment.
      </div>

      <div style={card}>
        <strong>Next Week Action Plan</strong><br />
        Focused steps for the coming week only.
      </div>
    </div>
  );
}

/* ===== STYLES ===== */

const page = {
  minHeight: "100vh",
  padding: 40,
  backgroundImage:
    "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/wealthyai/icons/weekpro.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  color: "#e5e7eb",
  fontFamily: "Inter, system-ui",
};

const back = {
  marginBottom: 20,
  padding: "6px 12px",
  fontSize: 13,
  borderRadius: 8,
  background: "rgba(2,6,23,0.6)",
  border: "1px solid #1e293b",
  color: "#7dd3fc",
  cursor: "pointer",
};

const title = { fontSize: "2.2rem", marginBottom: 20 };

const intro = { color: "#94a3b8", maxWidth: 600, marginBottom: 30 };

const card = {
  maxWidth: 640,
  marginBottom: 16,
  padding: 16,
  borderRadius: 12,
  background: "rgba(2,6,23,0.55)",
  border: "1px solid #1e293b",
};
