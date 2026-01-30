export default function HowItWorks() {
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

          <h1 style={title}>How WealthyAI Works</h1>

          <p style={intro}>
            WealthyAI is built on a simple principle:
            financial clarity improves when information is structured by time and context.
          </p>

          <Section title="The core concept">
            Instead of presenting isolated numbers or constant alerts,
            WealthyAI organizes financial understanding into distinct layers.
            <br /><br />
            Each layer answers a different type of question — without replacing or overriding the others.
          </Section>

          <Section title="The intelligence layers">
            <p>
              <strong>Basic Overview (Snapshot)</strong><br />
              A single-point view of income and expenses.
              Designed for orientation — not conclusions.
            </p>

            <p>
              <strong>Daily Intelligence</strong><br />
              A short, focused signal highlighting what matters today within the current cycle.
            </p>

            <p>
              <strong>Weekly Intelligence</strong><br />
              Pattern recognition across days and categories,
              helping behavioral signals emerge gradually.
            </p>

            <p>
              <strong>Monthly Intelligence</strong><br />
              Multi-week context with regional interpretation
              and forward-looking structural perspective.
            </p>
          </Section>

          <Section title="What WealthyAI is not">
            <ul>
              <li>It is not a budgeting enforcement tool</li>
              <li>It does not provide financial, tax, or investment advice</li>
              <li>It does not optimize for returns or automate decisions</li>
            </ul>
          </Section>

          <p style={footer}>
            WealthyAI supports understanding — not control.
          </p>
        </div>
      </div>
    </div>
  );
}
