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
            WealthyAI is a financial intelligence system designed to reduce uncertainty,
            not to automate decisions.
            <br /><br />
            It works by structuring information across time — allowing meaning to emerge
            gradually instead of forcing conclusions from isolated numbers.
          </p>

          <Section title="The core idea">
            Most financial tools focus on control, optimization, or prediction.
            <br /><br />
            WealthyAI focuses on <strong>interpretation</strong>.
            It helps you understand pressure, direction, and structural limits
            before decisions are made.
          </Section>

          <Section title="Time-based intelligence layers">
            <p>
              <strong>Basic Overview</strong><br />
              A single-point snapshot of income and expenses.
              Useful for orientation, not for decisions.
            </p>

            <p>
              <strong>Daily Intelligence</strong><br />
              A short daily signal that reflects your current position
              within an ongoing financial cycle.
            </p>

            <p>
              <strong>Weekly Intelligence</strong><br />
              Behavioral interpretation across days and categories,
              including regional context.
            </p>

            <p>
              <strong>Monthly Intelligence</strong><br />
              Multi-week analysis with forward-looking context,
              regional interpretation, and decision-support framing.
            </p>
          </Section>

          <Section title="What WealthyAI deliberately avoids">
            <ul>
              <li>Rigid budgeting rules</li>
              <li>Behavior enforcement or scoring</li>
              <li>Financial promises or return projections</li>
            </ul>
          </Section>

          <p style={footer}>
            WealthyAI provides perspective — not instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
