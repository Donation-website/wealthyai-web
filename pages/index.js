export default function Home() {
  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#060b13",
        backgroundImage: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/wealthyai/wealthyai.png')",
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "white",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
        margin: 0,
        padding: 0
      }}
    >
      {/* TOP NAVIGATION */}
      <div
        style={{
          position: "absolute",
          top: "30px",
          right: "40px",
          display: "flex",
          gap: "28px",
          zIndex: 5,
          fontSize: "0.95rem"
        }}
      >
        <a href="/how-it-works" style={{ color: "white", textDecoration: "none", opacity: 0.85, cursor: "pointer" }}>How it works</a>
        <a href="/how-to-use" style={{ color: "white", textDecoration: "none", opacity: 0.85, cursor: "pointer" }}>How to use</a>
        <a href="/terms" style={{ color: "white", textDecoration: "none", opacity: 0.85, cursor: "pointer" }}>Terms</a>
      </div>

      {/* CENTER CONTENT */}
      <div style={{ textAlign: "center", zIndex: 2 }}>
        <h1
          style={{
            fontSize: "3.6rem",
            marginBottom: "0.6rem",
            fontWeight: "bold",
            letterSpacing: "1px"
          }}
        >
          WealthyAI
        </h1>
        <p
          style={{
            fontSize: "1.15rem",
            opacity: 0.9,
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: "1.5"
          }}
        >
          AI-powered financial thinking. Structured insights. Clear perspective. You decide.
        </p>
      </div>

      {/* START GOMB (Bal oldalon, középtől kicsit feljebb) */}
      <a 
        href="/start" // Erre az új oldalra visz
        style={{
          position: "absolute",
          top: "45%", // Kicsit a közép (50%) fölött
          left: "10%", // Bal oldalon
          transform: "translateY(-50%)", // Pontos igazítás a középhez képest
          padding: "14px 40px",
          backgroundColor: "rgba(255, 255, 255, 0.1)", // Áttetsző háttér
          border: "1px solid rgba(255, 255, 255, 0.6)", // Fehér keret
          borderRadius: "10px",
          color: "white",
          textDecoration: "none",
          fontWeight: "bold",
          fontSize: "1.2rem",
          cursor: "pointer",
          backdropFilter: "blur(8px)", // Elegáns elmosás effekt
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)",
          transition: "transform 0.2s, background-color 0.2s"
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
      >
        Start
      </a>

      {/* BOTTOM BAR */}
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          width: "100%",
          padding: "18px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(6px)",
          boxSizing: "border-box",
          zIndex: 4
        }}
      >
        <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
          © 2026 WealthyAI — All rights reserved.
        </div>
        <div style={{ display: "flex", gap: "18px" }}>
           {/* Képek cseréje a működő, egyszerű inline stílusra */}
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <img src="/wealthyai/icons/fb.png" alt="Facebook" style={{ width: "34px", height: "34px", cursor: "pointer" }} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <img src="/wealthyai/icons/insta.png" alt="Instagram" style={{ width: "34px", height: "34px", cursor: "pointer" }} />
          </a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer">
            <img src="/wealthyai/icons/x.png" alt="X" style={{ width: "34px", height: "34px", cursor: "pointer" }} />
          </a>
        </div>
      </div>
    </main>
  );
}
