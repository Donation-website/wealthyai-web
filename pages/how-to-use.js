export default function HowToUse() {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundImage: "url('/wealthyai/icons/use.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px"
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          backgroundColor: "rgba(255, 255, 255, 0.78)",
          padding: "40px",
          borderRadius: "12px",
          color: "#000",
          fontFamily: "Arial, sans-serif",
          lineHeight: "1.6"
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>How to use WealthyAI</h1>

        <h2>1. What is WealthyAI?</h2>
        <p>
          WealthyAI is an AI-powered financial planning and analysis platform.
          It helps you understand your financial situation, assess potential
          risks, and explore possible strategies based on the information you provide.
        </p>
        <p>
          WealthyAI does <strong>not</strong> provide guaranteed financial advice.
          All outputs are informational and educational only.
        </p>

        <h2>2. How do I get started?</h2>
        <p>
          To begin, simply click the <strong>Start</strong> button on the main page.
          You will be asked to enter basic financial information such as goals,
          time horizon, and risk tolerance.
        </p>

        <h2>3. What happens after I enter my data?</h2>
        <p>
          Based on your inputs, WealthyAI analyzes your situation and generates
          structured insights, highlighting potential opportunities and risks.
          The system focuses on clarity, logic, and transparency.
        </p>

        <h2>4. What do I receive?</h2>
        <p>
          You receive a personalized overview that helps you think through your
          financial decisions more consciously. This may include:
        </p>
        <ul>
          <li>Risk awareness</li>
          <li>Scenario-based thinking</li>
          <li>Strategic considerations</li>
        </ul>

        <h2>5. Access plans (coming soon)</h2>
        <p>
          WealthyAI will offer multiple access options:
        </p>
        <ul>
          <li><strong>Daily access</strong> – basic insights for short-term needs</li>
          <li><strong>Weekly access</strong> – extended analysis and comparisons</li>
          <li><strong>Monthly access</strong> – full-feature access with deeper insights</li>
        </ul>
        <p>
          Longer plans will provide additional functionality and better value.
          Exact features and pricing will be transparently displayed before any payment.
        </p>

        <p style={{ marginTop: "30px", fontStyle: "italic" }}>
          Always make financial decisions responsibly. You remain fully in control.
        </p>
      </div>
    </main>
  );
}
