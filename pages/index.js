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
          backgroundSize: "cover",          // ✅ KITÖLTI AZ OLDALT
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
            zIndex: 5,
            fontSize: "0.95rem",
          }}
        >
          <a href="/how-it-works" style={{ color: "white", textDecoration: "none", opacity: 0.85 }}>
            How it works
          </a>
          <a href="/how-to-use" style={{ color: "white", textDecoration: "none", opacity: 0.85 }}>
            How to use
          </a>
          <a href="/terms" style={{ color: "white", textDecoration: "none", opacity: 0.85 }}>
            Terms
          </a>
        </div>

        {/* CENTER */}
        <div style={{ textAlign: "center", zIndex: 2 }}>
          <h1 style={{ fontSize: "3.6rem", fontWeight: "bold", marginBottom: "18px" }}>
            WealthyAI
          </h1>

          <p style={{ maxWidth: "520px", margin: "0 auto", opacity: 0.9, lineHeight: "1.6" }}>
            AI-powered financial thinking.<br />
            Structured insights.<br />
            Clear perspective.<br />
            <strong>You decide.</strong>
          </p>

          <div
            className="pulse-group"
            style={{
              marginTop: "28px",
              display: "flex",
              justifyContent: "center",
              gap: "26px",
              fontSize: "0.9rem",
              opacity: 0.75,
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
            zIndex: 3,
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
            backgroundColor: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(6px)",
            boxSizing: "border-box",
            zIndex: 4,
          }}
        >
          <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            © 2026 WealthyAI — All rights reserved.
          </div>

          <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/wealthyai/icons/fb.png" alt="Facebook" style={{ width: 34 }} />
            </a>

            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(SITE_URL)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/wealthyai/icons/x.png" alt="X" style={{ width: 34 }} />
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/wealthyai/icons/insta.png" alt="LinkedIn" style={{ width: 34 }} />
            </a>
          </div>
        </div>

        {/* ANIMATIONS */}
        <style>{`
          .pulse-group span {
            animation: pulseSoft 4.5s ease-in-out infinite;
          }

          .pulse-group span:nth-child(2) {
            animation-delay: 1.5s;
          }

          .pulse-group span:nth-child(3) {
            animation-delay: 3s;
          }

          @keyframes pulseSoft {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }

          .start-btn {
            transition: box-shadow 0.35s ease;
          }

          .start-btn:hover {
            box-shadow: 0 0 40px rgba(56,189,248,0.45);
          }
        `}</style>
      </main>
    </>
  );
}
