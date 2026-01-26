import React from "react";
import Head from "next/head";

export default function Home() {
  const SITE_URL = "https://wealthyai-web.vercel.app";
  const IMAGE_URL = `${SITE_URL}/wealthyai/wealthyai.png`;

  return (
    <>
      <Head>
        <title>WealthyAI – AI-powered financial clarity</title>
        <meta name="description" content="AI-powered financial planning with structured insights." />
        
        {/* OPEN GRAPH - Ez kell a képhez megosztáskor */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content="WealthyAI – AI-powered financial clarity" />
        <meta property="og:description" content="Structured insights and clear perspective." />
        <meta property="og:image" content={IMAGE_URL} />

        {/* X (TWITTER) CARD - Ez kell az X-hez */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="WealthyAI" />
        <meta name="twitter:image" content={IMAGE_URL} />

        <link href="https://fonts.googleapis.com" rel="stylesheet" />
      </Head>

      <main
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#060b13",
          backgroundImage: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/wealthyai/wealthyai.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          fontFamily: "'Inter', 'Arial', sans-serif",
          position: "relative",
          overflow: "hidden",
          margin: 0,
        }}
      >
        {/* TOP NAV */}
        <div style={{ position: "absolute", top: "30px", right: "40px", display: "flex", gap: "28px", zIndex: 6 }}>
          <a href="/how-it-works" className="nav-link">How it works</a>
          <a href="/how-to-use" className="nav-link">How to use</a>
          <a href="/terms" className="nav-link">Terms</a>
        </div>

        {/* LOGO & TEXT */}
        <div style={{ textAlign: "center", zIndex: 3, transform: "translateY(-40px)" }}>
          <img src="/wealthyai/icons/generated.png" alt="Logo" style={{ width: "860px", maxWidth: "95vw" }} />
          <div style={{ marginTop: "-110px" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: "300", marginBottom: "15px" }}>
              AI-powered financial thinking.<br />Structured insights.
            </div>
          </div>
        </div>

        <a href="/start" className="start-btn" style={{ position: "absolute", top: "45%", left: "10%", padding: "14px 40px", backgroundColor: "#1a253a", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "10px", color: "white", textDecoration: "none", fontWeight: "bold" }}>
          Start
        </a>

        {/* BOTTOM BAR - JAVÍTOTT MEGOSZTÁS */}
        <div style={{ position: "absolute", bottom: 0, width: "100%", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 5 }}>
          <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>© 2026 WealthyAI</div>

          <div style={{ display: "flex", gap: "18px" }}>
            <a href={`https://www.facebook.com{encodeURIComponent(SITE_URL)}`} target="_blank" rel="noreferrer">
              <img src="/wealthyai/icons/fb.png" style={{ width: 34 }} alt="FB share" />
            </a>
            <a href={`https://twitter.com{encodeURIComponent(SITE_URL)}&text=WealthyAI%20-%20Financial%20Clarity`} target="_blank" rel="noreferrer">
              <img src="/wealthyai/icons/x.png" style={{ width: 34 }} alt="X share" />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
              <img src="/wealthyai/icons/insta.png" style={{ width: 34 }} alt="Insta" />
            </a>
          </div>
        </div>

        <style>{`
          .nav-link { color: white; text-decoration: none; opacity: 0.85; }
          .start-btn:hover { box-shadow: 0 0 35px rgba(56,189,248,0.45); }
        `}</style>
      </main>
    </>
  );
}
