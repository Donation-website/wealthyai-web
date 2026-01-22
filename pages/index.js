export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('/wealthyai/wealthyai.png')",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundColor: "black",
        color: "white",
        fontFamily: "Arial, sans-serif",
        position: "relative"
      }}
    >
      {/* Center text */}
      <div style={{ textAlign: "center", maxWidth: "600px", zIndex: 1 }}>
        <h1 style={{ fontSize: "3.5rem", marginBottom: "0.6rem" }}>
          WealthyAI
        </h1>
        <p style={{ opacity: 0.9, fontSize: "1.15rem" }}>
          AI-powered financial clarity to help you understand, plan,
          and make smarter decisions about your money.
        </p>
      </div>

      {/* Footer */}
      <footer
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: "1100px",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(8px)",
          borderRadius: "12px",
          fontSize: "0.85rem"
        }}
      >
        <div style={{ opacity: 0.85 }}>
          © 2026 WealthyAI
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
          <a href="/how-it-works" style={linkStyle}>How it works</a>
          <a href="/terms" style={linkStyle}>Terms</a>

          <div style={{ display: "flex", gap: "16px" }}>
            <SocialIcon src="/wealthyai/icons/fb.png" />
            <SocialIcon src="/wealthyai/icons/insta.png" />
            <SocialIcon src="/wealthyai/icons/x.png" />
          </div>
        </div>
      </footer>
    </main>
  );
}

function SocialIcon({ src }) {
  return (
    <img
      src={src}
      alt=""
      style={{
        width: "28px",
        height: "28px",
        cursor: "pointer",
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
      }}
    />
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  opacity: 0.85
};
