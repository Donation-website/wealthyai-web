export default function DayHelpPage() {
  return (
    <div style={page}>
      {/* FUTURISTIC BACKGROUND */}
      <div style={bgGrid} />
      <div style={bgLines} />
      <div style={bgGlow} />

      <div style={content}>
        <div style={container}>
          <button onClick={() => window.history.back()} style={back}>
            ← Back
          </button>

          <h1 style={title}>How Daily Financial Intelligence Works</h1>

          <p style={intro}>
            This page explains how to use the <strong>Daily view</strong> in WealthyAI.
            The goal is fast clarity — not long-term planning, not pressure.
          </p>

          <Section title="What this page is">
            The Daily view gives you a <strong>financial pulse for today</strong>.
            <br /><br />
            It is designed for quick awareness: understanding where you stand right now
            and what direction the next few days are heading.
          </Section>

          <Section title="What the daily analysis does">
            The system looks at:
            <ul>
              <li>your current income input</li>
              <li>your fixed and variable costs</li>
              <li>your immediate surplus or deficit</li>
            </ul>
            Based on this, it provides a short, grounded interpretation.
          </Section>

          <Section title="What this analysis does NOT do">
            <ul>
              <li>It does not replace weekly or monthly planning</li>
              <li>It does not predict long-term outcomes</li>
              <li>It does not judge spending decisions</li>
              <li>It does not enforce rules or budgets</li>
            </ul>
          </Section>

          <Section title="How to read the daily insight">
            <p><strong>Today's Financial State</strong><br />
            A snapshot of where you stand right now.</p>

            <p><strong>What This Means</strong><br />
            Context for your current numbers.</p>

            <p><strong>7-Day Direction</strong><br />
            A conservative short-term outlook — not a promise.</p>
          </Section>

          <Section title="Daily vs Weekly analysis">
            Daily analysis is about awareness.
            <br /><br />
            Weekly analysis helps you detect patterns that are invisible day-by-day.
          </Section>

          <p style={footer}>
            WealthyAI supports clarity — not control.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===== SECTION COMPONENT ===== */

function Section({ title, children }) {
  return (
    <div style={section}>
      <h2 style={sectionTitle}>{title}</h2>
      <div style={sectionText}>{children}</div>
    </div>
  );
}

/* ===== PAGE & LAYOUT ===== */

const page = {
  position: "relative",
  minHeight: "100vh",
  background: "#020617",
  overflow: "hidden",
  fontFamily: "Inter, system-ui",
};

const content = {
  position: "relative",
  zIndex: 10,
  padding: 40,
  display: "flex",
  justifyContent: "center",
};

const container = {
  width: "100%",
  maxWidth: 900,
};

/* ===== FUTURISTIC BACKGROUND ===== */

const bgGrid = {
  position: "fixed",
  inset: 0,
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
  backgroundSize: "80px 80px",
  zIndex: 1,
};

const bgLines = {
  position: "fixed",
  inset: 0,
  backgroundImage:
    "linear-gradient(120deg, transparent 40%, rgba(56,189,248,0.08) 50%, transparent 60%)",
  backgroundSize: "1200px 1200px",
  zIndex: 2,
};

const bgGlow = {
  position: "fixed",
  inset: 0,
  background:
    "radial-gradient(circle at 30% 20%, rgba(56,189,248,0.12), transparent 40%), radial-gradient(circle at 70% 80%, rgba(167,139,250,0.12), transparent 45%)",
  zIndex: 3,
};

/* ===== UI ELEMENTS ===== */

const back = {
  marginBottom: 24,
  padding: "6px 12px",
  fontSize: 13,
  borderRadius: 8,
  background: "rgba(148,163,184,0.18)",
  border: "1px solid rgba(148,163,184,0.35)",
  color: "#ffffff",
  cursor: "pointer",
};

const title = {
  fontSize: "2.2rem",
  marginBottom: 12,
  color: "#ffffff",
};

const intro = {
  color: "#e5e7eb",
  maxWidth: 720,
  marginBottom: 32,
  fontSize: 15,
};

/* ===== GLASS SECTIONS ===== */

const section = {
  width: "100%",
  marginBottom: 28,
  padding: 24,
  borderRadius: 16,
  background: "rgba(56,189,248,0.14)",
  border: "1px solid rgba(125,211,252,0.35)",
  backdropFilter: "blur(12px)",
};

const sectionTitle = {
  fontSize: "1.15rem",
  color: "#f0f9ff",
  marginBottom: 10,
};

const sectionText = {
  fontSize: 15,
  lineHeight: 1.65,
  color: "#f8fafc",
};

const footer = {
  marginTop: 48,
  fontSize: 14,
  color: "#e5e7eb",
  maxWidth: 720,
};
