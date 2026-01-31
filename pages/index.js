import React from "react";
import Head from "next/head";

export default function Home() {
  const SITE_URL = "https://wealthyai-web.vercel.app";
  const SHARE_TEXT = "AI-powered financial clarity with WealthyAI";

  const clearSelectionIfNeeded = (e) => {
    const tag = e.target.tagName.toLowerCase();
    const interactive = ["a", "button", "input", "textarea", "select", "label"];
    if (!interactive.includes(tag)) {
      const sel = window.getSelection();
      if (sel && sel.toString()) sel.removeAllRanges();
    }
  };

  return (
    <>
      <Head>
        <title>WealthyAI – AI-powered financial clarity</title>
        <meta
          name="description"
          content="AI-powered financial planning with structured insights and clear perspective."
        />

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
        onMouseDown={clearSelectionIfNeeded}
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
        <div className="top-nav">
          <a href="/how-it-works" className="nav-link">How it works</a>
          <a href="/how-to-use" className="nav-link">How to use</a>
          <a href="/terms" className="nav-link">Terms</a>
        </div>

        {/* CENTER BRAND */}
        <div className="center-wrap">
          <img
            src="/wealthyai/icons/generated.png"
            alt="WealthyAI logo"
            className="brand-logo"
          />

          <div className="center-text">
            <div className="headline">
              AI-powered financial thinking.<br />
              Structured insights.<br />
              Clear perspective.
            </div>

            <div className="pulse-row">
              <span className="discrete-pulse">Not advice.</span>
              <span className="discrete-pulse">Not predictions.</span>
              <span className="discrete-pulse">Financial intelligence.</span>
            </div>
          </div>
        </div>

        {/* START */}
        <div className="start-wrap">
          <a href="/start" className="start-btn">Start</a>
          <div className="start-sub">
            Start with a simple financial snapshot. Takes less than a minute.
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="bottom-bar">
          <div className="copyright">
            © 2026 WealthyAI — All rights reserved.
          </div>

          <div className="bottom-right">
            <div className="contact nav-link">
              <div><strong>Contact & Partnerships</strong></div>
              <div>Media · Partnerships · Institutional use</div>
              <a href="mailto:wealthyaiweb@gmail.com" className="nav-link">
                wealthyaiweb@gmail.com
              </a>
            </div>

            <div className="social">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`} target="_blank" rel="noopener noreferrer">
                <img src="/wealthyai/icons/fb.png" alt="Facebook" />
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`} target="_blank" rel="noopener noreferrer">
                <img src="/wealthyai/icons/x.png" alt="X" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                <img src="/wealthyai/icons/insta.png" alt="Instagram" />
              </a>
            </div>
          </div>
        </div>

        <style>{`
          .top-nav {
            position: absolute;
            top: 30px;
            right: 40px;
            display: flex;
            gap: 28px;
            z-index: 6;
            font-size: 0.95rem;
          }

          .center-wrap {
            text-align: center;
            z-index: 3;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            transform: translateY(-40px);
          }

          .brand-logo {
            width: 860px;
            max-width: 95vw;
            animation: logoFloat 9s ease-in-out infinite;
          }

          .center-text {
            margin-top: -110px;
            max-width: 800px;
            padding: 0 20px;
          }

          .headline {
            font-size: 1.55rem;
            font-weight: 300;
            opacity: 0.9;
            margin-bottom: 15px;
          }

          .pulse-row {
            display: flex;
            justify-content: center;
            gap: 15px;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 1.4px;
          }

          .start-wrap {
            position: absolute;
            top: 45%;
            left: 10%;
            transform: translateY(-50%);
            z-index: 4;
          }

          .start-btn {
            padding: 14px 40px;
            background-color: #1a253a;
            border: 1px solid rgba(255,255,255,0.4);
            border-radius: 10px;
            color: white;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.2rem;
          }

          .bottom-bar {
            position: absolute;
            bottom: 0;
            width: 100%;
            padding: 18px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .social img {
            width: 34px;
          }

          /* ===== MOBILE ONLY ===== */
          @media (max-width: 768px) {
            .top-nav {
              right: 50%;
              transform: translateX(50%);
              top: 14px;
              gap: 16px;
              font-size: 0.85rem;
            }

            .center-wrap {
              transform: translateY(10px);
            }

            .center-text {
              margin-top: -40px;
            }

            .headline {
              font-size: 1.15rem;
            }

            .pulse-row {
              flex-wrap: wrap;
              gap: 8px;
            }

            .start-wrap {
              position: static;
              margin-top: 20px;
              align-items: center;
            }

            .bottom-bar {
              flex-direction: column;
              gap: 12px;
              text-align: center;
            }

            .bottom-right {
              align-items: center;
            }
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
