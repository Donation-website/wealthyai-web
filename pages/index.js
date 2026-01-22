export default function Home() {
  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/wealthyai/wealthyai.png')",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundColor: "black",
        position: "relative",
        color: "white",
        fontFamily: "Arial, sans-serif"
      }}
    >
      {/* CENTER TEXT */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center"
        }}
      >
        <h1 style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>
          WealthyAI
        </h1>
        <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>
          Professional financial planning powered by AI.
        </p>
      </div>

      {/* FOOTER */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: "1100px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(6px)",
          borderRadius: "12px"
        }}
      >
        {/* LEFT */}
        <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
          © 2026 WealthyAI
        </div>

        {/* CENTER LINKS */}
        <div style={{ display: "flex", gap: "20px", fontSize: "0.9rem" }}>
          <a href="/how-it-works" style={link}>How it works</a>
          <a href="/terms" style={link}>Terms</a>
        </div>

        {/* RIGHT ICONS */}
        <div style={{ display: "flex", gap: "16px" }}>
          <a href="https://facebook.com" target="_blank">
            <img src="/wealthyai/icons/fb.png" style={icon} />
          </a>
          <a href="https://instagram.com" target="_blank">
            <img src="/wealthyai/icons/insta.png" style={icon} />
          </a>
          <a href="https://x.com" target="_blank">
            <img src="/wealthyai/icons/x.png" style={icon} />
          </a>
        </div>
      </div>
    </main>
  );
}

const icon = {
  width: "32px",
  height: "32px",
  cursor: "pointer"
};

const link = {
  color: "white",
  textDecoration: "none",
  opacity: 0.85
};
