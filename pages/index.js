export default function Home() {
  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // JAVÍTÁS: Sötét kitöltő szín a szélekre (képhez passzoló sötétkék/fekete)
        backgroundColor: "#060b13", 
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/wealthyai/wealthyai.png')",
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "white",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden"
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
        <a href="/how-it-works" style={navLinkStyle}>How it works</a>
        <a href="/how-to-use" style={navLinkStyle}>How to use</a>
        <a href="/terms" style={navLinkStyle}>Terms</a>
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
          AI-powered financial thinking.  
          Structured insights. Clear perspective.  
          You decide.
        </p>
      </div>

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
        {/* COPYRIGHT */}
        <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
          © 2026 WealthyAI — All rights reserved.
        </div>

        {/* SOCIAL ICONS */}
        <div style={{ display: "flex", gap: "18px" }}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <img src="/wealthyai/icons/fb.png" alt="Facebook" style={iconStyle} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <img src="/wealthyai/icons/insta.png" alt="Instagram" style={iconStyle} />
          </a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer">
            <img src="/wealthyai/icons/x.png" alt="X" style={iconStyle} />
          </a>
        </div>
      </div>
    </main>
  );
}

/* ===== STYLES ===== */

const navLinkStyle = {
  color: "white",
  textDecoration: "none",
  opacity: 0.85,
  transition: "opacity 0.2s",
  cursor: "pointer" // JAVÍTÁS: Látszódjon, hogy kattintható
};

const iconStyle = {
  width: "34px",
  height: "34px",
  filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.6))",
  transition: "transform 0.2s",
  cursor: "pointer"
};
