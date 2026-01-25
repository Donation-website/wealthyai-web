export default function HelpPage() {
  return (
    <div style={page}>
      <button onClick={() => window.history.back()} style={back}>
        ← Back
      </button>

      <h1 style={title}>How Weekly Financial Intelligence Works</h1>

      <p style={intro}>
        This page explains how to read and use your weekly insights in WealthyAI.
        Clear, human, and judgment-free.
      </p>

      <Section title="What this page is">
        This page provides weekly financial intelligence — not basic expense tracking
        and not long-term financial planning.
      </Section>

      <Section title="How to read the insights">
        <ul>
          <li><strong>Weekly Snapshot</strong> – what happened this week</li>
          <li><strong>What This Means</strong> – why it matters</li>
          <li><strong>Behavior Signal</strong> – a spending pattern, not a verdict</li>
          <li><strong>Next Week Action Plan</strong> – focus for the coming week</li>
          <li><strong>Outlook</strong> – short forward-looking context</li>
        </ul>
      </Section>

      <Section title="Why weekly analysis matters">
        Financial habits form gradually. Weekly analysis helps you notice drift
        early and adjust before problems grow.
      </Section>

      <p style={footer}>
        WealthyAI supports awareness — not control.
      </p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={section}>
      <h2 style={sectionTitle}>{title}</h2>
      <div style={sectionText}>{children}</div>
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

const title = {
  fontSize: "2.2rem",
  marginBottom: 12,
};

const intro = {
  color: "#94a3b8",
  maxWidth: 640,
  marginBottom: 30,
};

const section = {
  maxWidth: 720,
  marginBottom: 28,
  padding: 20,
  border: "1px solid #1e293b",
  borderRadius: 14,
  background: "rgba(2,6,23,0.55)",
  backdropFilter: "blur(6px)",
};

const sectionTitle = {
  fontSize: "1.1rem",
  color: "#7dd3fc",
  marginBottom: 8,
};

const sectionText = {
  fontSize: 14,
  lineHeight: 1.6,
  color: "#cbd5f5",
};

const footer = {
  marginTop: 40,
  fontSize: 13,
  color: "#64748b",
};
