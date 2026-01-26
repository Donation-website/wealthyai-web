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
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          * {
            box-sizing: border-box;
          }
        `}</style>
      </Head>

      <main
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Arial, sans-serif",
          color: "white",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/wealthyai/wealthyai.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* TOP NAV */}
        <nav
          style={{
            position: "absolute",
            top: 30,
            right: 40,
            display: "flex",
            gap: 28,
            fontSize: "0.95rem",
            zIndex: 10,
          }}
        >
          <a href="/how-it-works" className="nav-link">How it works</a>
          <a href="/how-to-use" className="nav-link">How to use</a>
          <a href="/terms" className="nav-link">Terms</a>
        </nav>

        {/* HERO – EGYETLEN KÖZÉPSŐ BLOKK */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            zIndex: 5,
          }}
        >
          {/* ANIMÁLT LOGÓ */}
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

          {/* FEHÉR SZÖVEG */}
          <div
            style={{
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

          {/* PULZÁLÓ SOR */}
          <div
            className="pulse-group"
            style={{
              display: "flex",
              gap: "34px",
              fontSize: "1.05rem",
            }}
          >
            <span>Not advice.</span>
            <span>Not predictions.</span>
            <span>Financial intelligence.</span>
          </div>
        </section>

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
            zIndex: 10,
          }}
        >
          Start
        </a>

        {/* FOOTER – ÁTLÁTSZÓ */}
        <footer
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
            fontSize: "0.85rem",
            opacity: 0.85,
            zIndex: 10,
          }}
        >
          <span>© 2026 WealthyAI — All rights reserved.</span>

          <div style={{ display: "flex", gap: "18px" }}>
            <img src="/wealthyai/icons/fb.png" style={{ width: 34 }} />
            <img src="/wealthyai/icons/x.png" style={{ width: 34 }} />
            <img src="/wealthyai/icons/insta.png" style={{ width: 34 }} />
          </div>
        </footer>

        {/* ANIMÁCIÓK */}
        <style>{`
          .brand-logo {
            animation: logoBreathe 12s ease-in-out infinite;
            transition: filter 0.4s ease;
          }

          .brand-logo:hover {
            filter: drop-shadow(0 0 30px rgba(56,189,248,0.6));
          }

          @keyframes logoBreathe {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
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

          .start-btn:hover,
          .nav-link:hover {
            box-shadow: 0 0 30px rgba(56,189,248,0.5);
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
