import React, { useState, useEffect } from "react";
import SEO from "../components/SEO";

export default function Home() {
  const SITE_URL = "https://wealthyai-web.vercel.app";
  const SHARE_TEXT = "AI-powered financial clarity with WealthyAI";

  // 👇 MOBIL FIGYELŐ
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      <SEO
        title="WealthyAI – AI-powered financial clarity"
        description="AI-powered financial planning with structured insights and clear perspective."
        url={SITE_URL}
      />

      <main
        onMouseDown={clearSelectionIfNeeded}
        style={{
          height: isMobile ? "auto" : "100vh",
          minHeight: "100vh",
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: isMobile ? "flex-start" : "center",
          backgroundColor: "#060b13",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/wealthyai/wealthyai.png')",
          // JAVÍTÁS: Fixen a tetejére húzzuk a hátteret, hogy ne legyen fekete sáv felül
          backgroundPosition: "center top",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: isMobile ? "scroll" : "fixed",
          color: "white",
          fontFamily: "'Inter', system-ui, Arial, sans-serif",
          position: "relative",
          overflowX: "hidden",
          margin: 0,
          padding: 0,
        }}
      >
        {/* HULLÓCSILLAG ANIMÁCIÓ */}
        <div className="shooting-star"></div>

        {/* TOP NAV */}
        <div
          style={{
            position: "absolute",
            top: isMobile ? "20px" : "30px",
            right: isMobile ? "0" : "40px",
            left: isMobile ? "0" : "auto",
            display: "flex",
            justifyContent: isMobile ? "center" : "flex-end",
            gap: isMobile ? "15px" : "28px",
            zIndex: 6,
            fontSize: isMobile ? "0.8rem" : "0.95rem",
            width: isMobile ? "100%" : "auto",
            background: "transparent",
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
            transform: isMobile ? "none" : "translateY(-40px)",
            // JAVÍTÁS: Mobilon pontosított padding, hogy a logo lejjebb kerüljön a nav alá
            paddingTop: isMobile ? "130px" : "0px", 
          }}
        >
          <img
            src="/wealthyai/icons/generated.png"
            alt="WealthyAI logo"
            className="brand-logo"
            style={{
              width: isMobile ? "320px" : "860px",
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
              marginTop: isMobile ? "10px" : "-110px",
              width: "100%",
              maxWidth: "800px",
              padding: "0 20px",
              letterSpacing: "0.2px",
            }}
          >
            <div
              style={{
                fontSize: isMobile ? "1.1rem" : "1.55rem",
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
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "center",
                alignItems: "center",
                fontSize: isMobile ? "0.7rem" : "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "1.4px",
                opacity: 0.8,
                gap: isMobile ? "8px" : "15px",
                fontWeight: "500",
              }}
            >
              <span className="discrete-pulse">Not advice.</span>
              <span className="discrete-pulse">Not predictions.</span>
              <span className="discrete-pulse">Financial intelligence.</span>
            </div>
          </div>
        </div>

        {/* START SECTION */}
        <div
          style={{
            position: isMobile ? "relative" : "absolute",
            top: isMobile ? "auto" : "45%",
            left: isMobile ? "auto" : "10%",
            transform: isMobile ? "none" : "translateY(-50%)",
            marginTop: isMobile ? "40px" : "0",
            zIndex: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: isMobile ? "center" : "flex-start",
            gap: "10px",
            padding: isMobile ? "0 20px" : "0",
            textAlign: isMobile ? "center" : "left",
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
              fontSize: isMobile ? "1rem" : "1.2rem",
            }}
          >
            Start
          </a>
          <div style={{ fontSize: "0.85rem", opacity: 0.75, letterSpacing: "0.3px", maxWidth: isMobile ? "280px" : "100%" }}>
            Start with a simple financial snapshot. Takes less than a minute.
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            borderRadius: "6px",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            marginTop: "5px"
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <span style={{ fontSize: "10px", color: "#10b981", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              No Log-In System
            </span>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div
          style={{
            position: isMobile ? "relative" : "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            padding: isMobile ? "36px 24px 24px" : "18px 24px",
            display: "flex",
            flexDirection: isMobile ? "column-reverse" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "center" : "flex-end",
            zIndex: 5,
            boxSizing: "border-box",
            gap: isMobile ? "30px" : "0",
            background: isMobile
              ? "linear-gradient(to top, rgba(6,11,19,0.95) 0%, rgba(6,11,19,0.8) 50%, rgba(6,11,19,0.0) 100%)"
              : "transparent",
          }}
        >
          <div style={{ fontSize: "0.85rem", opacity: 0.6, paddingBottom: isMobile ? "0" : "6px" }}>
            © 2026 WealthyAI — All rights reserved.
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "center" : "flex-end", gap: "8px" }}>
            <a href="mailto:wealthyaiweb@gmail.com" className="nav-link" style={{ fontSize: "0.82rem", textAlign: isMobile ? "center" : "right", textDecoration: "none" }}>
              <div style={{ fontWeight: 500 }}>Contact & Partnerships</div>
              <div style={{ opacity: 0.8 }}>Media · Partnerships · Institutional use</div>
              <div style={{ fontWeight: 600 }}>wealthyaiweb@gmail.com</div>
            </a>
            <div style={{ display: "flex", gap: "18px", alignItems: "center", marginTop: isMobile ? "10px" : "0" }}>
              <img src="/wealthyai/icons/fb.png" alt="Facebook" style={{ width: 34 }} />
              <img src="/wealthyai/icons/x.png" alt="X" style={{ width: 34 }} />
              <img src="/wealthyai/icons/linkedin.png" alt="LinkedIn" style={{ width: 34 }} />
              <img src="/wealthyai/icons/insta.png" alt="Instagram" style={{ width: 34 }} />
            </div>
          </div>
        </div>

        <style>{`
          /* HULLÓCSILLAG */
          .shooting-star {
            position: absolute;
            top: 10%;
            left: 50%;
            width: 2px;
            height: 2px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 0 10px 2px white, 0 0 20px 2px rgba(56, 189, 248, 0.5);
            opacity: 0;
            z-index: 1;
            animation: shooting 10s linear infinite;
          }

          @keyframes shooting {
            0% { transform: translateX(0) translateY(0) rotate(-35deg) scale(0); opacity: 0; }
            5% { opacity: 1; transform: translateX(-100px) translateY(100px) rotate(-35deg) scale(1); }
            10% { opacity: 0; transform: translateX(-250px) translateY(250px) rotate(-35deg) scale(0); }
            100% { opacity: 0; }
          }

          .brand-logo {
            animation: logoFloat 9s ease-in-out infinite;
            transition: filter 0.4s ease;
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
            position: relative;
            color: white;
            text-decoration: none;
            opacity: 0.85;
          }

          .start-btn:hover {
            box-shadow: 0 0 35px rgba(56,189,248,0.45);
          }
        `}</style>
      </main>
    </>
  );
}
