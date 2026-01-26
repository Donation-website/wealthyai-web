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

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content="WealthyAI – AI-powered financial clarity" />
        <meta
          property="og:description"
          content="Structured financial insights and AI-powered optimization."
        />
        <meta property="og:image" content={`${SITE_URL}/wealthyai/wealthyai.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="WealthyAI – AI-powered financial clarity" />
        <meta
          name="twitter:description"
          content="Structured financial insights and AI-powered optimization."
        />
        <meta name="twitter:image" content={`${SITE_URL}/wealthyai/wealthyai.png`} />
      </Head>

      <main
        style={{
          height: "100vh",
          width: "100%",              // 🔥 EZ A KULCS
          boxSizing: "border-box",    // 🔥 BIZTOSÍTÁS
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#060b13",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/wealthyai/wealthyai.png')",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "white",
          fontFamily: "Arial, sans-serif",
          position: "relative",
          overflow: "hidden",         // 🔒 NINCS CSÚSZKA
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
          <h1 style={{ fontSize: "3.6rem", fontWeight: "bold" }}>WealthyAI</h1>
          <p style={{ maxWidth: "520px", margin: "0 auto", opacity: 0.9 }}>
            AI-powered financial thinking. Structured insights. Clear perspective. You decide.
          </p>
        </div>

        {/* START */}
        <a
          href="/start"
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
            width: "100%",             // 🔥 NEM 100vw
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
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                SITE_URL
              )}&text=AI-powered%20financial%20clarity%20with%20WealthyAI`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/wealthyai/icons/x.png" alt="X" style={{ width: 34 }} />
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                SITE_URL
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/wealthyai/icons/insta.png" alt="LinkedIn" style={{ width: 34 }} />
            </a>
          </div>
        </div>
      </main>
    </>
  );
}     
