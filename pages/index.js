import React from "react";
import Head from "next/head";

export default function Home() {
  const SITE_URL = "https://wealthyai-web.vercel.app";

  return (
    <>
      <Head>
        <title>WealthyAI – AI-powered financial clarity</title>
        <meta
          name="description"
          content="AI-powered financial planning with structured insights and clear perspective."
        />
      </Head>

      <main
        style={{
          height: "100vh",
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#060b13",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/wealthyai/wealthyai.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "white",
          fontFamily: "Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
          margin: 0,
          padding: 0,
        }}
      >
        {/* TOP NAV */}
        <div
          style={{
            position: "absolute",
            top: "30px",
            right: "40px",
            display: "flex",
            gap: "28px",
            zIndex: 6,
            fontSize: "0.95rem",
          }}
        >
          <a href="/how-it-works" className="nav-link">How it works</a>
          <a href="/how-to-use" className="nav-link">How to use</a>
          <a href="/terms" className="nav-link">Terms</a>
        </div>

        {/* CENTER BRAND */}
        <div
          style={{
            position: "relative",
            textAlign: "center",
            zIndex: 3,
          }}
        >
          <img
            src="/wealthyai/icons/generated.png"
            alt="WealthyAI logo"
            className="brand-logo"
            style={{
              width: "860px",
              maxWidth: "95vw",
            }}
          />

          {/* OVERLAY TEXT – RÉTEGEZVE */}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginTop: "-12px",
              lineHeight: 1.55,
              fontSize: "1.05rem",
              letterSpacing: "0.02em",
              opacity: 0.95,
              whiteSpace: "nowrap",
            }}
          >
            <div>AI-powered financial thinking.</div>
            <div>Structured insights.</div>

            <div className="pulse-soft" style={{ marginTop: "6px" }}>
              Clear perspective.
            </div>

            <div className="pulse-soft">
              Not advice. Not predictions.
            </div>

            <div style={{ marginTop: "6px" }}>
              Financial intelligence.
            </div>
          </div>
        </div>

        {/* START */}
        <a
          href="/start"
          className="start-btn"
          style={{
            position: "absolute",
            top: "45%",
            left: "10%",
            transform: "translateY(-50%)",
            padding: "14px 40px",
            backgroundColor: "#1a253a",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: "10px",
            color: "white",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "1.2rem",
            zIndex: 4,
          }}
        >
          Start
        </a>

        {/* BOTTOM BAR */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            padding: "18px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 5,
          }}
        >
          <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            © 2026 WealthyAI — All rights reserved.
          </div>

          <div style={{ display: "flex", gap: "18px" }}>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`} className="icon-link">
              <img src="/wealthyai/icons/fb.png" alt="Facebook" style={{ width: 34 }} />
            </a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(SITE_URL)}`} className="icon-link">
              <img src="/wealthyai/icons/x.png" alt="X" style={{ width: 34 }} />
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`} className="icon-link">
              <img src="/wealthyai/icons/insta.png" alt="LinkedIn" style={{ width: 34 }} />
            </a>
          </div>
        </div>

        {/* ANIMATIONS – LOGÓ ÉRINTETLEN */}
        <style>{`
          .brand-logo {
            animation: logoFloat 9s ease-in-out infinite;
          }

          @keyframes logoFloat {
            0% { transform: scale(1) translateY(0); opacity: 0.92; }
            35% { transform: scale(1.035) translateY(-6px); opacity: 1; }
            70% { transform: scale(1.02) translateY(3px); opacity: 0.97; }
            100% { transform: scale(1) translateY(0); opacity: 0.92; }
          }

          .pulse-soft {
            animation: pulseSoft 5.5s ease-in-out infinite;
          }

          @keyframes pulseSoft {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
          }

          .nav-link {
            color: white;
            text-decoration: none;
            opacity: 0.85;
          }
        `}</style>
      </main>
    </>
  );
}
