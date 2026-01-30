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
            It is meant to be opened when perspective is needed — not pressure.
          </p>

          <Section title="How to start">
            Begin with the Basic Overview to see a clear snapshot of your current situation.
            <br /><br />
            This step is about orientation, not evaluation.
          </Section>

          <Section title="Choosing the right level">
            Different questions require different time horizons:
            <ul>
              <li><strong>Daily</strong> — to regain short-term clarity</li>
              <li><strong>Weekly</strong> — to observe behavior and emerging patterns</li>
              <li><strong>Monthly</strong> — to understand structure, pressure, and direction</li>
            </ul>
            These levels are not hierarchical — they serve different purposes.
          </Section>

          <Section title="How often to use it">
            WealthyAI works best when used periodically.
            <br /><br />
            Over time, recurring signals create context —
            without enforcing habits or constant attention.
          </Section>

          <p style={footer}>
            You remain fully in control of all decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
