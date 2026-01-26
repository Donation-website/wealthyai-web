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

        {/* 🔒 GLOBÁLIS FIXEK */}
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            overflow-x: hidden;
          }
        `}</style>
      </Head>

      <main
        style={{
          height: "100vh",
          width: "100%",
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
        }}
      >
        {/* TOP NAV */}
        <div
          style={{
            position: "absolute",
            top: 30,
            right: 40,
            display: "flex",
            gap: 28,
            zIndex: 10,
            fontSize: "0.95rem",
          }}
        >
          <a href="/how-it-works" className="nav-link">How it works</a>
          <a href="/how-to-use" className="nav-link">How to use</a>
          <a href="/terms" className="nav-link">Terms</a>
        </div>

        {/* HERO STACK – EGYETLEN AKTÍV RÉTEG */}
        <div
          style={{
            zIndex: 5,
            textAlign: "center",
            marginTop: "40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "100%",
          }}
        >
          {/* AKTÍV, ANIMÁLT LOGÓ */}
          <img
            src="/wealthyai/icons/generated.png"
            alt="WealthyAI logo"
            className="brand-logo"
            style={{
              width: "860px",
              maxWidth: "95vw",
              height: "auto",
              marginBottom: "28px",
            }}
          />

          {/* 🔒 FEHÉR SZÖVEG – STATIKUS, NEM ANIMÁLT */}
          <div
            style={{
              color: "#ffffff",
              fontSize: "1.1rem",
              lineHeight: "1.6",
              maxWidth: "620px",
              marginBottom: "22px",
              opacity: 0.95,
            }}
          >
            AI-powered financial thinking.<br />
            Structured insights.<br />
            Clear perspective.
          </div>

          {/* 🔒 CSAK EZEK PULZÁLNAK */}
          <div
            className="pulse-group"
            style={{
              display: "flex",
              gap: "34px",
              fontSize: "1.05rem",
              color: "#ffffff",
            }}
          >
            <span>Not advice.</span>
            <span>Not predictions.</span>
            <span>Financial intelligence.</span>
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
            zIndex: 6,
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
            zIndex: 6,
          }}
        >
          <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            © 2026 WealthyAI — All rights reserved.
          </div>

          <div style={{ display: "flex", gap: "18px" }}>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`} target="_blank" rel="noopener noreferrer" className="icon-link">
              <img src="/wealthyai/icons/fb.png" style={{ width: 34 }} />
            </a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(SITE_URL)}`} target="_blank" rel="noopener noreferrer" className="icon-link">
              <img src="/wealthyai/icons/x.png" style={{ width: 34 }} />
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`} target="_blank" rel="noopener noreferrer" className="icon-link">
              <img src="/wealthyai/icons/insta.png" style={{ width: 34 }} />
            </a>
          </div>
        </div>

        {/* ANIMATIONS */}
        <style>{`
          .brand-logo {
            animation: logoBreathe 12s ease-in-out infinite;
            transition: filter 0.4s ease;
          }

          .brand-logo:hover {
            filter: drop-shadow(0 0 30px rgba(56,189,248,0.6));
          }

          @keyframes logoBreathe {
            0% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.025); opacity: 1; }
            100% { transform: scale(1); opacity: 0.9; }
          }

          .pulse-group span {
            animation: pulseSoft 3s ease-in-out infinite;
          }

          .pulse-group span:nth-child(2) { animation-delay: 1s; }
          .pulse-group span:nth-child(3) { animation-delay: 2s; }

          @keyframes pulseSoft {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }

          .start-btn,
          .nav-link,
          .icon-link {
            transition: box-shadow 0.35s ease, filter 0.35s ease;
          }

          .start-btn:hover,
          .nav-link:hover,
          .icon-link:hover {
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
