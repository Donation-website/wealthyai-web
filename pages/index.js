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
        {/* Modern szögletes betűtípus importálása */}
        <link href="https://fonts.googleapis.com" rel="stylesheet" />
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
          fontFamily: "'Inter', 'Arial', sans-serif",
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

        {/* CENTER BRAND & TEXT CONTAINER (Az egész blokk együtt mozog felfelé) */}
        <div
          style={{
            textAlign: "center",
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            // Az egész tartalom feljebb tolva a középpontból (~2 cm)
            transform: "translateY(-40px)", 
          }}
        >
          <img
            src="/wealthyai/icons/generated.png"
            alt="WealthyAI logo"
            className="brand-logo"
            style={{
              width: "860px",
              maxWidth: "95vw",
              display: "block"
            }}
          />
          
          {/* SZÖVEGEK (Szorosan a logó alatt) */}
          <div style={{ 
            color: "#FFFFFF", 
            lineHeight: "1.4",
            textAlign: "center",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            // Szorosan a logó alá pozícionálva
            marginTop: "-110px", 
            width: "100%",
            maxWidth: "800px",
            padding: "0 20px"
          }}>
            
            {/* Felső, nagy méretű blokk */}
            <div style={{ 
              fontSize: "1.6rem", 
              fontWeight: "300", 
              opacity: 0.9,
              marginBottom: "15px", // Még közelebb hozva az alsó blokkhoz
              lineHeight: "1.4"
            }}>
              AI-powered financial thinking.<br />
              Structured insights.<br />
              Clear perspective.
            </div>
            
            {/* Alsó, kisebb méretű, sorba rendezett blokk (mind pulzál, szűkebb sorköz) */}
            <div style={{ 
              display: "flex", 
              justifyContent: "center",
              alignItems: "center",
              fontSize: "0.95rem",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              opacity: 0.8,
              gap: "15px" // Szűkebb rés az elemek között
            }}>
              <span className="discrete-pulse">Not advice.</span>
              <span className="discrete-pulse">Not predictions.</span>
              <span className="discrete-pulse">Financial intelligence.</span>
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
            background: "transparent",
            boxSizing: "border-box",
            zIndex: 5,
          }}
        >
          <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            © 2026 WealthyAI — All rights reserved.
          </div>

          <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
            {/* FACEBOOK */}
            <a
              href={`https://www.facebook.com{encodeURIComponent(SITE_URL)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-link"
            >
              <img src="/wealthyai/icons/fb.png" alt="Facebook" style={{ width: 34 }} />
            </a>

            {/* X (TWITTER) */}
            <a
              href={`https://twitter.com{encodeURIComponent(SITE_URL)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-link"
            >
              <img src="/wealthyai/icons/x.png" alt="X" style={{ width: 34 }} />
            </a>

            {/* INSTAGRAM */}
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="icon-link"
            >
              <img src="/wealthyai/icons/insta.png" alt="Instagram" style={{ width: 34 }} />
            </a>
          </div>
        </div>

        <style>{`
          .brand-logo {
            animation: logoFloat 9s ease-in-out infinite;
            transition: filter 0.4s ease;
          }

          @keyframes logoFloat {
            0% { transform: scale(1) translateY(0); opacity: 0.92; }
            35% { transform: scale(1.035) translateY(-6px); opacity: 1; }
            70% { transform: scale(1.02) translateY(3px); opacity: 0.97; }
            100% { transform: scale(1) translateY(0); opacity: 0.92; }
          }

          .discrete-pulse {
            animation: discretePulse 3s ease-in-out infinite;
          }

          @keyframes discretePulse {
            0% { opacity: 0.4; }
            50% { opacity: 1; }
            100% { opacity: 0.4; }
          }

          .start-btn:hover, .nav-link:hover, .icon-link:hover {
            box-shadow: 0 0 35px rgba(56,189,248,0.45);
            filter: drop-shadow(0 0 18px rgba(56,189,248,0.45));
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
