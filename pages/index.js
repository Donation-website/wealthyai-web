import React from "react";
import Head from "next/head";

export default function Home() {
  const SITE_URL = "https://wealthyai-web.vercel.app";
  const SHARE_TEXT = "AI-powered financial clarity with WealthyAI";

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
          content="Structured insights. Clear perspective. Financial intelligence."
        />
        <meta
          property="og:image"
          content="https://wealthyai-web.vercel.app/wealthyai/wealthyai.png"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="WealthyAI – AI-powered financial clarity" />
        <meta
          name="twitter:description"
          content="Structured insights. Clear perspective. Financial intelligence."
        />
        <meta
          name="twitter:image"
          content="https://wealthyai-web.vercel.app/wealthyai/wealthyai.png"
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
          fontFamily: "'Inter', system-ui, Arial, sans-serif",
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

        {/* CENTER BRAND & TEXT */}
        <div
          style={{
            textAlign: "center",
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
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
              display: "block",
              cursor: "pointer",
            }}
          />

          <div
            style={{
              color: "#FFFFFF",
              lineHeight: "1.45",
              textAlign: "center",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              marginTop: "-110px",
              width: "100%",
              maxWidth: "800px",
              padding: "0 20px",
              letterSpacing: "0.2px",
            }}
          >
            <div
              style={{
                fontSize: "1.55rem",
                fontWeight: "300",
                opacity: 0.9,
                marginBottom: "15px",
              }}
            >
              AI-powered financial thinking.<br />
              Structured insights.<br />
              Clear perspective.
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "1.4px",
                opacity: 0.8,
                gap: "15px",
                fontWeight: "500",
              }}
            >
              <span className="discrete-pulse">Not advice.</span>
              <span className="discrete-pulse">Not predictions.</span>
              <span className="discrete-pulse">Financial intelligence.</span>
            </div>
          </div>
        </div>

        {/* START */}
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "10%",
            transform: "translateY(-50%)",
            zIndex: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
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

          <div
            style={{
              fontSize: "0.85rem",
              opacity: 0.75,
              letterSpacing: "0.3px",
            }}
          >
            Start with a simple financial snapshot. Takes less than a minute.
          </div>
        </div>

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
            alignItems: "flex-end",
            zIndex: 5,
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            © 2026 WealthyAI — All rights reserved.
          </div>

          {/* CENTER CONTACT */}
          <div
            style={{
              textAlign: "center",
              fontSize: "0.8rem",
              opacity: 0.75,
              lineHeight: 1.4,
            }}
          >
            <div style={{ fontWeight: 500 }}>Contact & Partnerships</div>
            <div>wealthyaiweb@gmail.com</div>
          </div>

          {/* SOCIAL ICONS */}
          <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-link"
            >
              <img src="/wealthyai/icons/fb.png" alt="Facebook" style={{ width: 34 }} />
            </a>

            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-link"
            >
              <img src="/wealthyai/icons/x.png" alt="X" style={{ width: 34 }} />
            </a>

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

          .brand-logo:hover {
            filter: drop-shadow(0 0 18px rgba(56,189,248,0.55));
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
