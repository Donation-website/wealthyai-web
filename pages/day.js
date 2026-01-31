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
      </Head>

      <main
        className="main-root"
        onMouseDown={clearSelectionIfNeeded}
        style={{
          height: "100vh",
          width: "100%",
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
        }}
      >
        {/* TOP NAV */}
        <div className="top-nav">
          <a href="/how-it-works" className="nav-link">How it works</a>
          <a href="/how-to-use" className="nav-link">How to use</a>
          <a href="/terms" className="nav-link">Terms</a>
        </div>

        {/* CENTER BRAND */}
        <div className="center-brand">
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

            <div className="badge-row">
              <span className="discrete-pulse">Not advice.</span>
              <span className="discrete-pulse">Not predictions.</span>
              <span className="discrete-pulse">Financial intelligence.</span>
            </div>
          </div>
        </div>

        {/* START */}
        <div className="start-block">
          <a href="/start" className="start-btn">Start</a>
          <div className="start-sub">
            Start with a simple financial snapshot. Takes less than a minute.
          </div>
        </div>

        <style>{`
          /* ===== DESKTOP (EREDTI VISZELKEDÉS) ===== */

          .top-nav {
            position: absolute;
            top: 30px;
            right: 40px;
            display: flex;
            gap: 28px;
            z-index: 6;
          }

          .center-brand {
            position: relative;
            z-index: 3;
            text-align: center;
            transform: translateY(-40px);
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

          /* ===== MOBIL – A VALÓDI FIX ===== */
          @media (max-width: 768px) {

            .main-root {
              flex-direction: column;
              justify-content: flex-start;
              padding-top: 90px;
            }

            .top-nav {
              position: fixed;
              top: 18px;
              left: 50%;
              transform: translateX(-50%);
            }

            .start-block {
              position: relative;
              transform: none;
              left: auto;
              top: auto;
              order: 1;
              align-items: center;
              text-align: center;
              margin-bottom: 24px;
            }

            .center-brand {
              transform: none;
              order: 2;
            }

            .badge-row {
              flex-direction: column;
              gap: 6px;
            }
          }
        `}</style>
      </main>
    </>
  );
}
