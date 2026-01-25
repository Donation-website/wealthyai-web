export default function HelpPage() {
  return (
    <div style={page}>
      {/* FUTURISTIC BACKGROUND LAYERS */}
      <div style={bgGrid} />
      <div style={bgLines} />
      <div style={bgGlow} />

      <div style={content}>
        <button onClick={() => window.history.back()} style={back}>
          ← Back
        </button>

        <h1 style={title}>How Weekly Financial Intelligence Works</h1>

        <p style={intro}>
          This page explains how to read and use your weekly insights in WealthyAI.
          The goal is clarity — not judgment, not pressure.
        </p>

        <Section title="What this page is">
          WealthyAI provides <strong>weekly financial intelligence</strong>.
          This is not a budgeting spreadsheet, not a finance course, and not daily coaching.
          <br /><br />
          The weekly view is designed to help you understand how your financial behavior
          evolves over short periods — before small issues turn into long-term problems.
        </Section>

        <Section title="What the weekly analysis does">
          Each week, the system looks at:
          <ul>
            <li>your reported weekly income</li>
            <li>your total weekly spending</li>
            <li>how spending is distributed across days</li>
            <li>how spending is distributed across categories</li>
          </ul>
          From this, it highlights patterns that are difficult to notice day-by-day.
        </Section>

        <Section title="What this analysis does NOT do">
          <ul>
            <li>It does not judge or score you</li>
            <li>It does not assume perfect data</li>
            <li>It does not replace professional financial advice</li>
            <li>It does not force budgeting rules on you</li>
          </ul>
        </Section>

        <Section title="How to read the insights">
          <p><strong>Weekly Snapshot</strong><br />
          A factual summary of what happened this week.</p>

          <p><strong>What This Means</strong><br />
          Explains why the snapshot matters.</p>

          <p><strong>Behavior Signal</strong><br />
          Describes a pattern — not a verdict.</p>

          <p><strong>Next Week Action Plan</strong><br />
          Focused actions for the coming week only.</p>

          <p><strong>1-Month Outlook</strong><br />
          Short forward-looking context when data allows.</p>
        </Section>

        <Section title="Why weekly analysis matters">
          Financial problems rarely appear overnight.
          <br /><br />
          Weekly analysis helps you notice drift early — while correction is easy.
        </Section>

        <Section title="Weekly vs Monthly plans">
          Weekly focuses on short-term awareness.
          <br /><br />
          Monthly plans unlock deeper pattern recognition across multiple weeks.
        </Section>

        <p style={footer}>
          WealthyAI supports awareness — not control.
        </p>
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
  color: "#e5e7eb",
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
  animation: "moveLines 40s linear infinite",
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
  background: "rgba(255,255,255,0.18)",
  border: "1px solid rgba(255,255,255,0.35)",
  color: "#ffffff",
  cursor: "pointer",
};

const title = {
  fontSize: "2.2rem",
  marginBottom: 12,
};

const intro = {
  color: "#e5e7eb",
  maxWidth: 720,
  marginBottom: 32,
  fontSize: 15,
};

/* ===== GLASS SECTIONS ===== */

const section = {
  maxWidth: 820,
  marginBottom: 28,
  padding: 24,
  borderRadius: 16,
  background: "rgba(255,255,255,0.18)",
  border: "1px solid rgba(255,255,255,0.35)",
  backdropFilter: "blur(10px)",
};

const sectionTitle = {
  fontSize: "1.15rem",
  color: "#ffffff",
  marginBottom: 10,
};

const sectionText = {
  fontSize: 15,
  lineHeight: 1.65,
  color: "#ffffff",
};

const footer = {
  marginTop: 48,
  fontSize: 14,
  color: "#e5e7eb",
  maxWidth: 720,
};
