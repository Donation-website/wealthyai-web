export default function Terms() {
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

          <h1 style={title}>Terms & Principles</h1>

          <p style={intro}>
            WealthyAI is an informational platform focused on financial awareness and understanding.
          </p>

          <Section title="Use of information">
            All insights are generated from user-provided inputs
            and contextual analytical models.
            <br /><br />
            They do not constitute financial, legal, tax, or investment advice.
          </Section>

          <Section title="Payments & security">
            All payments are securely processed through Stripe.
            <br /><br />
            WealthyAI does not store credit card details
            or sensitive payment information.
          </Section>

          <Section title="User responsibility">
            Users remain fully responsible for how insights are interpreted and applied.
            <br /><br />
            WealthyAI provides perspective — not decisions.
          </Section>

          <p style={footer}>
            Transparency over promises. Awareness over control.
          </p>
        </div>
      </div>
    </div>
  );
}
