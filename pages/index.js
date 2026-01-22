export default function Home() {
  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('/wealthyai/wealthyai.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "white",
        fontFamily: "Arial, sans-serif",
        position: "relative"
      }}
    >
      {/* Center content */}
      <div style={{ textAlign: "center", maxWidth: "600px", zIndex: 1 }}>
        <h1 style={{ fontSize: "3.5rem", marginBottom: "0.6rem" }}>
          WealthyAI
        </h1>
        <p style={{ opacity: 0.9, fontSize: "1.15rem" }}>
          AI-powered financial clarity to help you understand, plan, and make
          smarter decisions about your money — without complexity.
        </p>
      </div>

      {/* Footer */}
      <footer
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          padding: "14px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(6px)",
          fontSize: "0.85rem"
        }}
      >
        <div style={{ opacity: 0.85 }}>
          © 2026 WealthyAI. All rights reserved.
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <a href="/how-it-works" style={linkStyle}>How it works</a>
          <a href="/terms" style={linkStyle}>Terms</a>

          <div style={{ display: "flex", gap: "12px" }}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <img src="/wealthyai/icons/fb.png" width="20" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <img src="/wealthyai/icons/insta.png" width="20" />
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer">
              <img src="/wealthyai/icons/x.png" width="20" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  opacity: 0.85
};
