export default function HelpPage() {
  return (
    <div style={page}>
      {/* FUTURISTIC BACKGROUND LAYERS */}
      <div style={bgGrid} />
      <div style={bgLines} />
      <div style={bgGlow} />

      <div style={content}>
        <div style={container}>
          <button onClick={() => window.history.back()} style={back}>
            ← Back
          </button>

          <h1 style={title}>How Monthly Financial Intelligence Works</h1>

          <p style={intro}>
            This page explains how to use the Monthly Intelligence view in WealthyAI.
            The purpose is long-range clarity — not optimization, not control.
          </p>

          <Section title="What this page is">
            The monthly view provides <strong>strategic financial intelligence</strong>.
            <br /><br />
            It is designed to help you understand pressure, structure, and direction
            across a longer time horizon — not daily noise.
          </Section>

          <Section title="What the monthly analysis focuses on">
            Each monthly briefing looks at:
            <ul>
              <li>structural cost pressure</li>
              <li>recurring rigidity vs flexibility</li>
              <li>signals that persist across weeks</li>
              <li>regional constraints and context</li>
            </ul>
            The goal is to surface what truly matters over the next 90 days.
          </Section>

          <Section title="Daily signals within a monthly cycle">
            Although the plan is monthly, the system generates
            <strong> one signal per day</strong>.
            <br /><br />
            Each daily signal reflects your position within the current monthly cycle
            and builds on previous signals to form a continuous narrative.
          </Section>

          <Section title="What this analysis does NOT do">
            <ul>
              <li>It does not provide budgeting rules</li>
              <li>It does not give financial advice</li>
              <li>It does not judge individual decisions</li>
              <li>It does not require perfect data</li>
            </ul>
          </Section>

          <Section title="Why returning daily matters">
            Financial pressure is rarely visible all at once.
            <br /><br />
            Daily signals allow patterns to emerge gradually,
            making direction clearer before decisions become urgent.
          </Section>

          <Section title="Monthly vs Weekly intelligence">
            Weekly intelligence focuses on short-term behavior.
            <br /><br />
            Monthly intelligence focuses on structure, persistence,
            and forward direction.
          </Section>

          <p style={footer}>
            WealthyAI provides awareness — not control.
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
