import React, { useEffect } from "react";
import Head from "next/head";

export default function Home() {
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.overflowX = "hidden";
  }, []);

  return (
    <>
      <Head>
        <title>WealthyAI – AI-powered financial clarity</title>
      </Head>

      <main style={page}>
        <div style={bgImage} />
        <div style={bgGlow} />
        <div style={bgGrid} />

        <nav style={nav}>
          <a href="/how-it-works" style={navLink}>How it works</a>
          <a href="/how-to-use" style={navLink}>How to use</a>
          <a href="/terms" style={navLink}>Terms</a>
        </nav>

        <div style={center}>
          <div style={logoWrap}>
            <h1 style={logo}>WealthyAI</h1>
          </div>

          <p style={tagline}>
            AI-powered financial thinking.<br />
            Structured insights. Clear perspective.<br />
            <strong>You decide.</strong>
          </p>

          <div style={microCopy}>
            <span>Not advice.</span>
            <span>Not predictions.</span>
            <span>Financial intelligence.</span>
          </div>
        </div>

        <a href="/start" style={startButton} className="start-btn">
          Start
          <div style={startSub}>Begin with your current situation</div>
        </a>

        <footer style={footer}>
          <span>© 2026 WealthyAI — All rights reserved.</span>

          <div style={socials}>
            <a href="https://www.facebook.com/sharer/sharer.php?u=https://wealthyai-web.vercel.app" target="_blank" rel="noreferrer">
              <img src="/wealthyai/icons/fb.png" style={icon} />
            </a>
            <a href="https://twitter.com/intent/tweet?url=https://wealthyai-web.vercel.app" target="_blank" rel="noreferrer">
              <img src="/wealthyai/icons/x.png" style={icon} />
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
              <img src="/wealthyai/icons/insta.png" style={icon} />
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}

/* ===== STYLES ===== */

const page = {
  position: "relative",
  width: "100%",
  maxWidth: "100vw",
  height: "100vh",
  overflow: "hidden",
  fontFamily: "Inter, system-ui, sans-serif",
  color: "white",
};

const bgImage = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('/wealthyai/wealthyai.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  zIndex: 1,
};

const bgGlow = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(circle at 30% 40%, rgba(56,189,248,0.18), transparent 45%), radial-gradient(circle at 70% 60%, rgba(167,139,250,0.18), transparent 45%)",
  animation: "pulse 14s ease-in-out infinite",
  zIndex: 2,
};

const bgGrid = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
  backgroundSize: "120px 120px",
  opacity: 0.2,
  zIndex: 3,
};

const nav = {
  position: "absolute",
  top: 30,
  right: 40,
  display: "flex",
  gap: 28,
  zIndex: 10,
};

const navLink = {
  color: "white",
  textDecoration: "none",
  opacity: 0.75,
  fontSize: "0.95rem",
};

const center = {
  position: "relative",
  zIndex: 5,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
};

const logoWrap = {
  animation: "float 10s ease-in-out infinite",
};

const logo = {
  fontSize: "3.8rem",
  margin: 0,
  fontWeight: "bold",
};

const tagline = {
  marginTop: 16,
  fontSize: "1.05rem",
  lineHeight: 1.6,
  opacity: 0.9,
};

const microCopy = {
  marginTop: 22,
  display: "flex",
  gap: 14,
  fontSize: "0.85rem",
  opacity: 0.75,
};

const startButton = {
  position: "absolute",
  left: "8%",
  top: "50%",
  transform: "translateY(-50%)",
  padding: "16px 42px",
  background: "rgba(26,37,58,0.9)",
  border: "1px solid rgba(255,255,255,0.4)",
  borderRadius: 12,
  color: "white",
  fontSize: "1.2rem",
  fontWeight: "bold",
  textDecoration: "none",
  zIndex: 6,
};

const startSub = {
  fontSize: "0.75rem",
  marginTop: 6,
  opacity: 0.75,
};

const footer = {
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  padding: "14px 24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(0,0,0,0.35)",
  backdropFilter: "blur(6px)",
  zIndex: 10,
  fontSize: "0.85rem",
};

const socials = {
  display: "flex",
  gap: 18,
};

const icon = {
  width: 32,
  cursor: "pointer",
};

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes float {
      0% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
      100% { transform: translateY(0); }
    }

    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `;
  document.head.appendChild(style);
}
