export default function HowItWorks() {
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
}
