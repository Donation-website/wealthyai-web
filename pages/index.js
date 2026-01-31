import React from "react";
import Head from "next/head";

export default function Home() {
  const SITE_URL = "https://wealthyai-web.vercel.app";
  const SHARE_TEXT = "AI-powered financial clarity with WealthyAI";

  // 👇 KIJELÖLÉS TÖRLÉSE NEM FUNKCIONÁLIS KATTINTÁSNÁL
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
        className="page-root"
      >
        {/* TOP NAV */}
        <div className="top-nav">
          <a href="/how-it-works" className="nav-link">How it works</a>
          <a href="/how-to-use" className="nav-link">How to use</a>
          <a href="/terms" className="nav-link">Terms</a>
        </div>

        {/* CENTER BRAND & TEXT */}
        <div className="center-wrap">
          <img
            src="/wealthyai/icons/generated.png"
            alt="WealthyAI logo"
            className="brand-logo"
          />

          <div className="hero-text">
            <div className="hero-headline">
              AI-powered financial thinking.<br />
              Structured insights.<br />
              Clear perspective.
            </div>

            <div className="hero-sub">
              <span className="discrete-pulse">Not advice.</span>
              <span className="discrete-pulse">Not predictions.</span>
              <span className="discrete-pulse">Financial intelligence.</span>
            </div>
          </div>
        </div>

        {/* START */}
        <div className="start-block">
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
            <div className="contact-block nav-link">
              <div className="contact-title">Contact & Partnerships</div>
              <div className="contact-sub">
                Media · Partnerships · Institutional use
              </div>
              <div>
                <a
                  href="mailto:wealthyaiweb@gmail.com"
                  className="nav-link contact-mail"
                >
                  wealthyaiweb@gmail.com
                </a>
              </div>
            </div>

            <div className="social-icons">
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
          .page-root {
            height: 100vh;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #060b13;
            background-image:
              linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)),
              url('/wealthyai/wealthyai.png');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            color: white;
            font-family: 'Inter', system-ui, Arial, sans-serif;
            position: relative;
            overflow: hidden;
            margin: 0;
            padding: 0;
          }

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
            cursor: pointer;
            animation: logoFloat 9s ease-in-out infinite;
            transition: filter 0.4s ease;
          }

          .brand-logo:hover {
            filter: drop-shadow(0 0 18px rgba(56,189,248,0.55));
          }

          .hero-text {
            margin-top: -110px;
            max-width: 800px;
            padding: 0 20px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.5);
          }

          .hero-headline {
            font-size: 1.55rem;
            font-weight: 300;
            opacity: 0.9;
            margin-bottom: 15px;
          }

          .hero-sub {
            display: flex;
            justify-content: center;
            gap: 15px;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 1.4px;
            opacity: 0.8;
            font-weight: 500;
          }

          .start-block {
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
            background-color: #1a253a;
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
            letter-spacing: 0.3px;
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

          .social-icons img {
            width: 34px;
          }

          .nav-link {
            color: white;
            text-decoration: none;
            opacity: 0.85;
          }

          .start-btn:hover,
          .nav-link:hover,
          .icon-link:hover {
            box-shadow: 0 0 35px rgba(56,189,248,0.45);
            filter: drop-shadow(0 0 18px rgba(56,189,248,0.45));
          }

          .discrete-pulse {
            animation: discretePulse 3s ease-in-out infinite;
          }

          @keyframes discretePulse {
            0% { opacity: 0.4; }
            50% { opacity: 1; }
            100% { opacity: 0.4; }
          }

          @keyframes logoFloat {
            0% { transform: scale(1) translateY(0); opacity: 0.92; }
            35% { transform: scale(1.035) translateY(-6px); opacity: 1; }
            70% { transform: scale(1.02) translateY(3px); opacity: 0.97; }
            100% { transform: scale(1) translateY(0); opacity: 0.92; }
          }

          /* ================= MOBILE ADDITIONS ================= */

          @media (max-width: 768px) {
            .top-nav {
              position: absolute;
              top: 0;
              right: 0;
              width: 100%;
              justify-content: center;
              padding: 14px 0;
              background: rgba(6,11,19,0.75);
              backdrop-filter: blur(6px);
              font-size: 0.9rem;
            }

            .center-wrap {
              transform: none;
              margin-top: 80px;
            }

            .brand-logo {
              width: 300px;
              max-width: 90%;
            }

            .hero-text {
              margin-top: 10px;
            }

            .hero-sub {
              flex-direction: column;
              gap: 6px;
            }

            .start-block {
              position: static;
              transform: none;
              margin-top: 20px;
              align-items: center;
            }

            .bottom-bar {
              position: static;
              flex-direction: column;
              gap: 14px;
              padding-bottom: 20px;
            }

            .bottom-right {
              align-items: center;
              text-align: center;
            }

            .social-icons {
              justify-content: center;
            }
          }
        `}</style>
      </main>
    </>
  );
}
