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
            style={{
              width: "860px",
              maxWidth: "95vw",
              display: "block",
              cursor: "pointer",
            }}
          />

          <div className="hero-text">
            <div className="hero-main">
              AI-powered financial thinking.<br />
              Structured insights.<br />
              Clear perspective.
            </div>

            <div className="hero-tags">
              <span className="discrete-pulse">Not advice.</span>
              <span className="discrete-pulse">Not predictions.</span>
              <span className="discrete-pulse">Financial intelligence.</span>
            </div>
          </div>
        </div>

        {/* START */}
        <div className="start-wrap">
          <a href="/start" className="start-btn">
            Start
          </a>
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
              <div style={{ fontWeight: 500 }}>Contact & Partnerships</div>
              <div style={{ opacity: 0.8 }}>
                Media · Partnerships · Institutional use
              </div>
              <div>
                <a
                  href="mailto:wealthyaiweb@gmail.com"
                  className="nav-link"
                  style={{ fontWeight: 600 }}
                >
                  wealthyaiweb@gmail.com
                </a>
              </div>
            </div>

            <div className="socials">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="icon-link"
              >
                <img src="/wealthyai/icons/fb.png" alt="Facebook" />
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="icon-link"
              >
                <img src="/wealthyai/icons/x.png" alt="X" />
              </a>

              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-link"
              >
                <img src="/wealthyai/icons/insta.png" alt="Instagram" />
              </a>
            </div>
          </div>
        </div>

        <style>{`
          /* DESKTOP – érintetlen */
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

          .hero-text {
            color: #fff;
            line-height: 1.45;
            text-shadow: 0 2px 10px rgba(0,0,0,0.5);
            margin-top: -110px;
            max-width: 800px;
            padding: 0 20px;
          }

          .hero-main {
            font-size: 1.55rem;
            font-weight: 300;
            opacity: 0.9;
            margin-bottom: 15px;
          }

          .hero-tags {
            display: flex;
            justify-content: center;
            gap: 15px;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 1.4px;
            opacity: 0.8;
            font-weight: 500;
          }

          .start-wrap {
            position: absolute;
            top: 45%;
            left: 10%;
            transform: translateY(-50%);
            z-index: 4;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .start-btn {
            padding: 14px 40px;
            background: #1a253a;
            border: 1px solid rgba(255,255,255,0.4);
            border-radius: 10px;
            color: white;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.2rem;
          }

          .start-sub {
            font-size: 0.85rem;
            opacity: 0.75;
          }

          .bottom-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: 18px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 5;
            box-sizing: border-box;
          }

          .bottom-right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
          }

          .socials {
            display: flex;
            gap: 18px;
          }

          .socials img {
            width: 34px;
          }

          .brand-logo {
            animation: logoFloat 9s ease-in-out infinite;
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

          /* 📱 MOBILE ONLY */
          @media (max-width: 768px) {
            .top-nav {
              top: 12px;
              right: 50%;
              transform: translateX(50%);
              gap: 18px;
              font-size: 0.8rem;
            }

            .center-wrap {
              transform: translateY(-10px);
            }

            .hero-text {
              margin-top: -40px;
            }

            .hero-main {
              font-size: 1.1rem;
            }

            .hero-tags {
              flex-wrap: wrap;
              gap: 10px;
              font-size: 0.7rem;
            }

            .start-wrap {
              top: auto;
              bottom: 120px;
              left: 20px;
              transform: none;
            }

            .start-btn {
              font-size: 1rem;
              padding: 12px 30px;
            }

            .bottom-bar {
              flex-direction: column;
              gap: 14px;
              padding-bottom: 20px;
            }

            .bottom-right {
              align-items: center;
              text-align: center;
            }
          }
        `}</style>
      </main>
    </>
  );
}
