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
        padding: "40px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          /* 🔵 WealthyAI sötétkék – a főoldallal egyező hangulat */
          backgroundColor: "rgba(6, 11, 19, 0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          padding: "40px",
          borderRadius: "20px",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
          lineHeight: "1.6",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <h1 style={{ marginBottom: "20px", fontWeight: "bold" }}>
          How to use WealthyAI
        </h1>

        <section>
          <h2 style={{ fontSize: "1.4rem" }}>1. What is WealthyAI?</h2>
          <p>
            WealthyAI is an AI-powered financial planning and analysis platform.
            It helps you understand your financial situation, assess potential
            risks, and explore possible strategies.
          </p>

          <h2 style={{ fontSize: "1.4rem" }}>2. How do I get started?</h2>
          <p>
            To begin, simply click the <strong>Start</strong> button on the main
            page. You will be asked to enter basic financial information such as
            goals and risk tolerance.
          </p>

          <h2 style={{ fontSize: "1.4rem" }}>3. What do I receive?</h2>
          <p>You receive a personalized overview focusing on:</p>
          <ul style={{ paddingLeft: "20px" }}>
            <li>Risk awareness</li>
            <li>Scenario-based thinking</li>
            <li>Strategic considerations</li>
          </ul>

          <h2 style={{ fontSize: "1.4rem" }}>4. Access plans</h2>
          <p>
            WealthyAI offers daily, weekly, and monthly access options to fit your
            needs.
          </p>
        </section>

        <p style={{ marginTop: "30px", fontStyle: "italic", fontWeight: "500" }}>
          Always make financial decisions responsibly. You remain fully in
          control.
        </p>

        {/* Back to Home */}
        <div style={{ marginTop: "20px" }}>
          <a
            href="/"
            style={{
              color: "#ffffff",
              textDecoration: "underline",
              fontSize: "0.9rem",
            }}
          >
            Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
