export default function HelpPage() {
  return (
    <div style={page}>
      <a href="/" style={back}>← Back</a>

      <h1 style={title}>How Weekly Financial Intelligence Works</h1>

      <p style={intro}>
        This page explains how to read and use your weekly insights in WealthyAI.
        No financial jargon. No judgment.
      </p>

      <Section title="What this page is">
        This page provides weekly financial intelligence — not basic expense tracking
        and not long-term financial planning.
      </Section>

      <Section title="What the analysis does">
        WealthyAI looks at your weekly income, spending totals, and how activity
        is distributed across days and categories to identify short-term patterns.
      </Section>

      <Section title="What it does NOT do">
        It does not judge you, predict the future with certainty, or replace
        professional financial advice.
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
        Financial issues usually develop gradually. Weekly analysis helps you
        notice drift early and adjust before habits solidify.
      </Section>

      <Section title="Weekly vs Monthly plans">
        Weekly analysis focuses on short-term decisions. Monthly plans allow
        deeper pattern analysis across multiple weeks.
      </Section>

      <p style={footer}>
        WealthyAI is designed to support awareness — not control.
      </p>
    </div>
  );
}

/* ---------- Components ---------- */

function Section({ title, children }) {
  return (
    <div style={section}>
      <h2 style={sectionTitle}>{title}</h2>
      <div style={sectionText}>{children}</div>
    </div>
  );
}

/* ---------- Styles ---------- */

const page = {
  minHeight: "100vh",
  padding: "40px 24px",
  background: "radial-gradient(circle at top, #020617, #000)",
  color: "#e5e7eb",
  fontFamily: "Inter, system-ui",
};

const back = {
  display: "inline-block",
  marginBottom: 20,
  color: "#7dd3fc",
  textDecoration: "none",
  fontSize: 13,
};

const title = {
  fontSize: "2.2rem",
  marginBottom: 10,
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
  background: "rgba(255,255,255,0.04)",
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
