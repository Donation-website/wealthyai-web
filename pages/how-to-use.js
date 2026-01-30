export default function HowToUse() {
  return (
    <div style={page}>
      <div style={bgGrid} />
      <div style={bgLines} />
      <div style={bgGlow} />

      <div style={content}>
        <div style={container}>
          <button onClick={() => window.history.back()} style={back}>
            ← Back
          </button>

          <h1 style={title}>How to Use WealthyAI</h1>

          <p style={intro}>
            WealthyAI is not designed for constant monitoring.
            It is meant to be used deliberately, when clarity is needed —
            not when pressure is high.
          </p>

          <Section title="Getting started">
            Begin with the Basic Overview to establish your current financial position.
            <br /><br />
            This snapshot is intentionally simple and serves as an entry point,
            not a decision tool.
          </Section>

          <Section title="Choosing the right depth">
            <ul>
              <li><strong>Daily</strong> — short-term orientation and immediate clarity</li>
              <li><strong>Weekly</strong> — understanding behavioral patterns</li>
              <li><strong>Monthly</strong> — context, structure, and forward direction</li>
            </ul>
          </Section>

          <Section title="Using it over time">
            WealthyAI becomes more valuable when used periodically.
            <br /><br />
            The system is designed to reveal patterns and shifts,
            not to enforce habits or routines.
          </Section>

          <p style={footer}>
            You remain fully responsible for every financial decision.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===== SHARED COMPONENTS & STYLES ===== */

function Section({ title, children }) {
  return (
    <div style={section}>
      <h2 style={sectionTitle}>{title}</h2>
      <div style={sectionText}>{children}</div>
    </div>
  );
}

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
