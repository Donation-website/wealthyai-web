export default function HowToUse() {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100vw",
        // JAVÍTOTT ÚTVONAL: ha a public/wealthyai/icons/use.png-ben van
        backgroundImage: "url('/wealthyai/icons/use.png')", 
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        boxSizing: "border-box" // Hogy ne lógjon ki a padding miatt
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          backgroundColor: "rgba(255, 255, 255, 0.85)", // Világos háttér a szövegnek
          padding: "40px",
          borderRadius: "12px",
          color: "#000000", // FEKETE SZÖVEG
          fontFamily: "Arial, sans-serif",
          lineHeight: "1.6",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
        }}
      >
        <h1 style={{ marginBottom: "20px", color: "#000" }}>How to use WealthyAI</h1>

        <section style={{ color: "#000" }}>
            <h2>1. What is WealthyAI?</h2>
            <p>WealthyAI is an AI-powered financial planning and analysis platform...</p>

            <h2>2. How do I get started?</h2>
            <p>To begin, simply click the <strong>Start</strong> button on the main page.</p>

            {/* Többi tartalom változatlan, de mind fekete lesz */}
            <h2>3. What happens after I enter my data?</h2>
            <p>Based on your inputs, WealthyAI analyzes your situation...</p>
        </section>

        <p style={{ marginTop: "30px", fontStyle: "italic", color: "#333" }}>
          Always make financial decisions responsibly.
        </p>
      </div>
    </main>
  );
}
