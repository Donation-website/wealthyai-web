import React, { useState, useEffect } from "react";

export default function HelpPage() {
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
      {/* FUTURISTIC BACKGROUND LAYERS */}
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
          }}>How Weekly Financial Intelligence Works</h1>

          <p style={intro}>
            This page explains how to read and use your weekly insights in WealthyAI.
            The goal is clarity — not judgment, not pressure.
          </p>

          <Section title="What this page is" isMobile={isMobile}>
            WealthyAI provides <strong>weekly financial intelligence</strong>.
            This is not a budgeting spreadsheet, not a finance course, and not daily coaching.
            <br /><br />
            The weekly view is designed to help you understand how your financial behavior
            evolves over short periods — before small issues turn into long-term problems.
          </Section>

          <Section title="What the weekly analysis does" isMobile={isMobile}>
            Each week, the system looks at:
            <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
              <li>your reported weekly income</li>
              <li>your total weekly spending</li>
              <li>how spending is distributed across days</li>
              <li>how spending is distributed across categories</li>
            </ul>
            From this, it highlights patterns that are difficult to notice day-by-day.
          </Section>

          <Section title="What this analysis does NOT do" isMobile={isMobile}>
            <ul style={{ paddingLeft: "20px" }}>
              <li>It does not judge or score you</li>
              <li>It does not assume perfect data</li>
              <li>It does not replace professional financial advice</li>
              <li>It does not force budgeting rules on you</li>
            </ul>
          </Section>

          <Section title="How to read the insights" isMobile={isMobile}>
            <p><strong>Weekly Snapshot</strong><br />
            A factual summary of what happened this week.</p>

            <p style={{ marginTop: "15px" }}><strong>What This Means</strong><br />
            Explains why the snapshot matters.</p>

            <p style={{ marginTop: "15px" }}><strong>Behavior Signal</strong><br />
            Describes a pattern — not a verdict.</p>

            <p style={{ marginTop: "15px" }}><strong>Next Week Action Plan</strong><br />
            Focused actions for the coming week only.</p>

            <p style={{ marginTop: "15px" }}><strong>1-Month Outlook</strong><br />
            Short forward-looking context when data allows.</p>
          </Section>

          <Section title="Why weekly analysis matters" isMobile={isMobile}>
            Financial problems rarely appear overnight.
            <br /><br />
            Weekly analysis helps you notice drift early — while correction is easy.
          </Section>

          <Section title="Weekly vs Monthly plans" isMobile={isMobile}>
            Weekly focuses on short-term awareness.
            <br /><br />
            Monthly plans unlock deeper pattern recognition across multiple weeks.
          </Section>

          <p style={footer}>
            WealthyAI supports awareness — not control.
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
  overflowX: "hidden", // Megakadályozza a vízszintes csúszkát mobilon
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

/* ===== GLASS SECTIONS – BLUE-TINTED ===== */

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
