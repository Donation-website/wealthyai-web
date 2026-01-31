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
        <div
          className="top-nav"
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
          className="start-wrap"
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
            }}
          >
            Start with a simple financial snapshot. Takes less than a minute.
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div
          className="bottom-bar"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            padding: "18px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 5,
            boxSizing: "border-box",
          }}
        >
          <div className="copyright" style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            © 2026 WealthyAI — All rights reserved.
          </div>

          <div
            className="bottom-right"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "8px",
            }}
          >
            <div className="nav-link" style={{ fontSize: "0.82rem" }}>
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

            <div className="socials" style={{ display: "flex", gap: "18px" }}>
              <img src="/wealthyai/icons/fb.png" style={{ width: 34 }} />
              <img src="/wealthyai/icons/x.png" style={{ width: 34 }} />
              <img src="/wealthyai/icons/insta.png" style={{ width: 34 }} />
            </div>
          </div>
        </div>

        <style>{`
          .brand-logo {
            animation: logoFloat 9s ease-in-out infinite;
          }

          @keyframes logoFloat {
            0% { transform: scale(1); }
            50% { transform: scale(1.035); }
            100% { transform: scale(1); }
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

          /* 📱 CSAK MOBIL – RÁÉPÍTÉS, PC ÉRINTETLEN */
          @media (max-width: 768px) {

            .top-nav {
              top: 10px !important;
              right: 50% !important;
              transform: translateX(50%);
              gap: 16px;
              font-size: 0.75rem;
            }

            .start-wrap {
              top: auto !important;
              bottom: 160px !important;
              left: 20px !important;
              transform: none !important;
            }

            .bottom-bar {
              flex-direction: column-reverse !important;
              gap: 14px;
              text-align: center;
            }

            .bottom-right {
              align-items: center !important;
            }

            .socials {
              justify-content: center;
            }
          }
        `}</style>
      </main>
    </>
  );
}
