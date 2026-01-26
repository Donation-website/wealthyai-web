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
            overflow-x: hidden;
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
          flexDirection: "column",
          alignItems: "center",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/wealthyai/wealthyai.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          fontFamily: "Arial, sans-serif",
          color: "white",
        }}
      >
        {/* TOP NAV */}
        <nav
          style={{
            alignSelf: "flex-end",
            padding: "30px 40px 0",
            display: "flex",
            gap: 28,
            fontSize: "0.95rem",
          }}
        >
          <a href="/how-it-works" className="nav-link">How it works</a>
          <a href="/how-to-use" className="nav-link">How to use</a>
          <a href="/terms" className="nav-link">Terms</a>
        </nav>

        {/* HERO – FLEX, DE NEM ABSOLUTE */}
        <section
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            textAlign: "center",
          }}
        >
          <img
            src="/wealthyai/icons/generated.png"
            alt="WealthyAI logo"
            style={{
              width: "860px",
              maxWidth: "95vw",
              marginBottom: "28px",
            }}
          />

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

        {/* START – RELATÍV POZÍCIÓ */}
        <div style={{ marginBottom: "20px" }}>
          <a
            href="/start"
            className="start-btn"
            style={{
              padding: "14px 40px",
              backgroundColor: "#1a253a",
              border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: "10px",
              color: "white",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "1.2rem",
            }}
          >
            Start
          </a>
        </div>

        {/* FOOTER – MOST MÁR LÁTSZANI FOG */}
        <footer
          style={{
            width: "100%",
            padding: "18px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.85rem",
            opacity: 0.85,
          }}
        >
          <span>© 2026 WealthyAI — All rights reserved.</span>

          <div style={{ display: "flex", gap: "18px" }}>
            <img src="/wealthyai/icons/fb.png" style={{ width: 34 }} />
            <img src="/wealthyai/icons/x.png" style={{ width: 34 }} />
            <img src="/wealthyai/icons/insta.png" style={{ width: 34 }} />
          </div>
        </footer>

        <style>{`
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
