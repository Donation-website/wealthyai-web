how it works: export default function HowItWorks() {
  return (
    <main style={{
      minHeight: "100vh",
      width: "100vw",
      backgroundImage: "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/wealthyai/icons/dia.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      color: "white",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      paddingTop: "80px",
      boxSizing: "border-box"
    }}>
      <div style={{
        maxWidth: "900px",
        background: "rgba(0,0,0,0.35)",
        padding: "40px",
        borderRadius: "14px",
        backdropFilter: "blur(8px)",
        lineHeight: "1.7",
        margin: "20px"
      }}>
        <h1>How WealthyAI Works</h1>
        <p>WealthyAI is designed to help individuals understand their financial situation through structured insights and clear explanations.</p>
        <p>The platform focuses on clarity, planning, and long-term thinking, helping users see their finances in context rather than isolated numbers.</p>
        <p>Visual elements and structured outputs help users better grasp trends, proportions, and potential outcomes.</p>
        <p>WealthyAI does not replace professional financial advisors and does not provide investment, tax, or legal advice.</p>
        
        {/* BACK TO HOME GOMB */}
        <div style={{ marginTop: "30px", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "20px" }}>
          <a href="/" style={{ color: "white", textDecoration: "underline", opacity: 0.8, fontSize: "0.9rem" }}>
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}                                                    How to use: export default function HowToUse() {
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
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          // Módosított áttetszőség: 0.25-ről 0.1-re csökkentve
          backgroundColor: "rgba(255, 255, 255, 0.1)", 
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          padding: "40px",
          borderRadius: "20px",
          // Szöveg színe fehérre javítva
          color: "#ffffff", 
          fontFamily: "Arial, sans-serif",
          lineHeight: "1.6",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.2)"
        }}
      >
        <h1 style={{ marginBottom: "20px", fontWeight: "bold" }}>How to use WealthyAI</h1>

        <section>
          <h2 style={{ fontSize: "1.4rem" }}>1. What is WealthyAI?</h2>
          <p>
            WealthyAI is an AI-powered financial planning and analysis platform.
            It helps you understand your financial situation, assess potential
            risks, and explore possible strategies.
          </p>

          <h2 style={{ fontSize: "1.4rem" }}>2. How do I get started?</h2>
          <p>
            To begin, simply click the <strong>Start</strong> button on the main page.
            You will be asked to enter basic financial information such as goals and risk tolerance.
          </p>

          <h2 style={{ fontSize: "1.4rem" }}>3. What do I receive?</h2>
          <p>
            You receive a personalized overview focusing on:
          </p>
          <ul style={{ paddingLeft: "20px" }}>
            <li>Risk awareness</li>
            <li>Scenario-based thinking</li>
            <li>Strategic considerations</li>
          </ul>

          <h2 style={{ fontSize: "1.4rem" }}>4. Access plans</h2>
          <p>
            WealthyAI offers daily, weekly, and monthly access options to fit your needs.
          </p>
        </section>

        <p style={{ marginTop: "30px", fontStyle: "italic", fontWeight: "500" }}>
          Always make financial decisions responsibly. You remain fully in control.
        </p>

        {/* Vissza gomb fehér színnel */}
        <div style={{ marginTop: "20px" }}>
          <a href="/" style={{ color: "#ffffff", textDecoration: "underline", fontSize: "0.9rem" }}>
            Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}     
