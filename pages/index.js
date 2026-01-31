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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
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

        <style>{`
          .nav-link { color: white; text-decoration: none; transition: opacity 0.2s; }
          .nav-link:hover { opacity: 0.7; }
          
          @keyframes discretePulse {
            0% { opacity: 0.4; }
            50% { opacity: 1; }
            100% { opacity: 0.4; }
          }
          .discrete-pulse {
            animation: discretePulse 3s infinite ease-in-out;
          }

          /* MOBIL ELRENDEZÉS */
          @media (max-width: 768px) {
            .top-nav {
              right: 0 !important;
              left: 0 !important;
              top: 20px !important;
              justify-content: center !important;
              width: 100% !important;
              gap: 15px !important;
              font-size: 0.8rem !important;
            }
            .brand-logo {
              width: 90% !important;
              margin-top: 40px !important;
            }
            .center-brand-container {
              transform: translateY(-20px) !important;
            }
            .hero-text {
              font-size: 1.1rem !important;
              margin-top: -40px !important;
            }
            .pulse-container {
              flex-direction: column !important;
              gap: 5px !important;
              font-size: 0.7rem !important;
            }
            .start-container {
              left: 20px !important;
              top: 65% !important;
              width: 80% !important;
            }
            .start-btn {
              padding: 10px 30px !important;
              font-size: 1rem !important;
            }
            .start-desc {
              font-size: 0.75rem !important;
              max-width: 200px !important;
            }
            .bottom-bar {
              flex-direction: column !important;
              gap: 15px !important;
              text-align: center !important;
              padding-bottom: 25px !important;
            }
            .contact-info {
              text-align: center !important;
              align-items: center !important;
            }
          }
        `}</style>
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
          className="center-brand-container"
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
            className="hero-text-container"
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
              className="hero-text"
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
              className="pulse-container"
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
          className="start-container"
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
            className="start-desc"
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
          <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            © 2026 WealthyAI — All rights reserved.
          </div>

          <div
            className="contact-info"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "8px",
            }}
          >
            {/* CONTACT & PARTNERSHIPS */}
            <div
              className="nav-link"
              style={{
                fontSize: "0.82rem",
                textAlign: "right",
                lineHeight: "1.4",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 500 }}>
                Contact & Partnerships
              </div>
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
          </div>
        </div>
      </main>
    </>
  );
}
