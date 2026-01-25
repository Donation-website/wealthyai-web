export default function HelpPage() {
  return (
    <div style={page}>
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
        It’s important to understand the limits:
        <ul>
          <li>It does not judge or score you</li>
          <li>It does not assume perfect data</li>
          <li>It does not replace professional financial advice</li>
          <li>It does not force budgeting rules on you</li>
        </ul>
        If data is incomplete, the system will clearly state that instead of guessing.
      </Section>

      <Section title="How to read the insights">
        <p><strong>Weekly Snapshot</strong><br />
        A factual summary of what happened this week. Think of it as a mirror.</p>

        <p><strong>What This Means</strong><br />
        Explains why the snapshot matters and what changed compared to normal behavior.</p>

        <p><strong>Behavior Signal</strong><br />
        A short description of your spending pattern. This is about <em>how</em> money moved,
        not whether it was “good” or “bad”.</p>

        <p><strong>Next Week Action Plan</strong><br />
        Focused, realistic steps for the coming week only — not long-term commitments.</p>

        <p><strong>1-Month Outlook</strong><br />
        A short forward-looking context based on available data. If confidence is low,
        the system will say so.</p>
      </Section>

      <Section title="Why weekly analysis matters">
        Financial problems rarely appear overnight.
        <br /><br />
        They usually develop gradually, week by week:
        small overspending, drifting habits, or missing visibility.
        <br /><br />
        Weekly analysis helps you notice these shifts early,
        while they are still easy to correct.
      </Section>

      <Section title="Weekly vs Monthly plans">
        The weekly plan focuses on short-term awareness and decision support.
        <br /><br />
        Monthly plans allow deeper pattern analysis across multiple weeks,
        making longer-term trends easier to identify.
        <br /><br />
        Upgrading is never required to use the system —
        it only expands analytical depth.
      </Section>

      <p style={footer}>
        WealthyAI is designed to support awareness, not control.
        You don’t need perfect data — just enough clarity to make the next decision better.
      </p>
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
  marginBottom: 24,
  padding: "6px 12px",
  fontSize: 13,
  borderRadius: 8,
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.35)",
  color: "#e5e7eb",
  cursor: "pointer",
};

const title = {
  fontSize: "2.2rem",
  marginBottom: 12,
};

const intro = {
  color: "#cbd5f5",
  maxWidth: 720,
  marginBottom: 32,
  fontSize: 15,
};

/* LIGHTER, GLASS-LIKE CARDS */

const section = {
  maxWidth: 820,
  marginBottom: 28,
  padding: 24,
  borderRadius: 16,
  background: "rgba(255,255,255,0.14)",
  border: "1px solid rgba(255,255,255,0.35)",
  backdropFilter: "blur(10px)",
};

const sectionTitle = {
  fontSize: "1.15rem",
  color: "#0f172a",
  marginBottom: 10,
};

const sectionText = {
  fontSize: 15,
  lineHeight: 1.65,
  color: "#020617",
};

const footer = {
  marginTop: 48,
  fontSize: 14,
  color: "#cbd5f5",
  maxWidth: 720,
};
