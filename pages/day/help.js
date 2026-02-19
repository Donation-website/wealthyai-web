import React, { useState, useEffect } from "react";

export default function DayHelpPage() {
  /* ===== MOBILE DETECTION ===== */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={page}>
      {/* FUTURISTIC BACKGROUND */}
      <div style={bgGrid} />
      <div style={bgLines} />
      <div style={bgGlow} />

      <div style={{
        ...content,
        padding: isMobile ? "20px 15px" : "40px"
      }}>
        <div style={container}>
          <button onClick={() => window.history.back()} style={back}>
            ← Back
          </button>

          <h1 style={{
            ...title,
            fontSize: isMobile ? "1.8rem" : "2.2rem"
          }}>Daily Financial Intelligence Help</h1>

          <p style={intro}>
            This page provides technical and functional guidance for the <strong>Daily Premium Access</strong>. 
            WealthyAI is designed to offer immediate clarity through regional intelligence.
          </p>

          <Section title="Regional & Currency Settings">
            The system now features a <strong>Region Selector</strong> located above your metrics. 
            <br /><br />
            You can switch between <strong>US ($), EU (€), UK (£), and HU (Ft)</strong>. This adjustment ensures that the AI interprets your surplus and expenses within the correct economic context, providing more relevant insights for your specific location.
          </Section>

          <Section title="What the Daily Analysis interprets" isMobile={isMobile}>
            The Daily view focuses on your immediate financial health by analyzing:
            <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
              <li><strong>Income Flow:</strong> Your primary monthly revenue input.</li>
              <li><strong>Fixed vs. Variable:</strong> The balance between non-negotiable costs and lifestyle spending.</li>
              <li><strong>Current Surplus:</strong> The precise amount of liquidity available for today's decisions.</li>
            </ul>
          </Section>

          <Section title="The AI Insight Panel" isMobile={isMobile}>
            When you trigger the <strong>Generate AI Strategy</strong> button, the system performs a real-time analysis:
            <p style={{ marginTop: "15px" }}><strong>1. Daily Financial State</strong><br />
            An objective breakdown of your current standing based on the selected region.</p>

            <p style={{ marginTop: "15px" }}><strong>2. Behavior Signal</strong><br />
            Identifies if your current spending habits are sustainable or if they signal high-risk financial strain.</p>

            <p style={{ marginTop: "15px" }}><strong>3. 7-Day Direction</strong><br />
            A short-term tactical plan to optimize your cash flow for the upcoming week.</p>
          </Section>

          <Section title="Projections & SpiderNet Visualization">
            The <strong>5Y Projection</strong> metric uses a conservative growth model (8-45% scaling) to show the long-term potential of your current daily surplus. 
            <br /><br />
            The <strong>SpiderNet animation</strong> (visible on desktop) dynamically adjusts its density based on the AI panel's height, representing the complexity of the neural processing happening in the background.
          </Section>

          <Section title="Limitations of Daily Access">
            <ul style={{ paddingLeft: "20px" }}>
              <li><strong>Local Storage:</strong> All financial data is stored locally in your browser. Clearing your cache will reset your inputs.</li>
              <li><strong>No Tax Stress-Testing:</strong> Detailed tax optimization and country-specific fiscal stress tests are reserved for Monthly Intelligence members.</li>
              <li><strong>Non-Advice:</strong> This system provides interpretation of data, not regulated financial advice.</li>
            </ul>
          </Section>

          <p style={footer}>
            © 2026 WealthyAI — Built for clarity, designed for time.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===== SECTION COMPONENT ===== */

function Section({ title, children, isMobile }) {
  return (
    <div style={{
      ...section,
      padding: isMobile ? "20px" : "24px"
    }}>
      <h2 style={sectionTitle}>{title}</h2>
      <div style={sectionText}>{children}</div>
    </div>
  );
}

/* ===== PAGE & LAYOUT ===== */

const page = {
  position: "relative",
  minHeight: "100vh",
  background: "#020617",
  overflowX: "hidden",
  fontFamily: "Inter, system-ui",
};

const content = {
  position: "relative",
  zIndex: 10,
  display: "flex",
  justifyContent: "center",
};

const container = {
  width: "100%",
  maxWidth: 900,
};

/* ===== FUTURISTIC BACKGROUND ===== */

const bgGrid = {
  position: "fixed",
  inset: 0,
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
  backgroundSize: "80px 80px",
  zIndex: 1,
};

const bgLines = {
  position: "fixed",
  inset: 0,
  backgroundImage:
    "linear-gradient(120deg, transparent 40%, rgba(56,189,248,0.08) 50%, transparent 60%)",
  backgroundSize: "1200px 1200px",
  zIndex: 2,
};

const bgGlow = {
  position: "fixed",
  inset: 0,
  background:
    "radial-gradient(circle at 30% 20%, rgba(56,189,248,0.12), transparent 40%), radial-gradient(circle at 70% 80%, rgba(167,139,250,0.12), transparent 45%)",
  zIndex: 3,
};

/* ===== UI ELEMENTS ===== */

const back = {
  marginBottom: 24,
  padding: "6px 12px",
  fontSize: 13,
  borderRadius: 8,
  background: "rgba(148,163,184,0.18)",
  border: "1px solid rgba(148,163,184,0.35)",
  color: "#ffffff",
  cursor: "pointer",
};

const title = {
  marginBottom: 12,
  color: "#ffffff",
  lineHeight: "1.2",
};

const intro = {
  color: "#e5e7eb",
  maxWidth: 720,
  marginBottom: 32,
  fontSize: 15,
  lineHeight: "1.5",
};

/* ===== GLASS SECTIONS ===== */

const section = {
  width: "100%",
  marginBottom: 28,
  borderRadius: 16,
  background: "rgba(56,189,248,0.14)",
  border: "1px solid rgba(125,211,252,0.35)",
  backdropFilter: "blur(12px)",
  boxSizing: "border-box",
};

const sectionTitle = {
  fontSize: "1.15rem",
  color: "#f0f9ff",
  marginBottom: 10,
};

const sectionText = {
  fontSize: 15,
  lineHeight: 1.65,
  color: "#f8fafc",
};

const footer = {
  marginTop: 48,
  marginBottom: 40,
  fontSize: 14,
  color: "#e5e7eb",
  maxWidth: 720,
};
