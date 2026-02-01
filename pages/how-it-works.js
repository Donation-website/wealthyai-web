import React, { useState, useEffect } from "react";

export default function HowItWorks() {
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
      {/* BACKGROUND */}
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
          }}>How WealthyAI Works</h1>

          <p style={intro}>
            WealthyAI is built around a single principle:
            financial clarity improves when information is structured by time,
            context, and decision horizon.
          </p>

          <Section title="The core idea">
            WealthyAI does not try to optimize or control your finances.
            <br /><br />
            Instead, it organizes financial information into clearly separated
            intelligence layers, each answering a different type of question.
          </Section>

          <Section title="The intelligence layers">
            <p>
              <strong>Basic Overview (Snapshot)</strong><br />
              A fast, single-point view of income and expenses.
              Designed for orientation only.
            </p>

            <p style={{ marginTop: "15px" }}>
              <strong>Daily Intelligence</strong><br />
              Short-form interpretation focused on immediate financial state.
              Useful when clarity is needed today.
            </p>

            <p style={{ marginTop: "15px" }}>
              <strong>Weekly Intelligence</strong><br />
              Behavioral pattern detection across days and categories,
              including regional context.
            </p>

            <p style={{ marginTop: "15px" }}>
              <strong>Monthly Intelligence</strong><br />
              Multi-week analysis that connects structure, pressure,
              and forward-looking signals to support better decisions.
            </p>
          </Section>

          <Section title="What WealthyAI is not">
            <ul style={{ paddingLeft: "20px" }}>
              <li>It is not a budgeting enforcement system</li>
              <li>It is not an automated decision-maker</li>
              <li>It does not promise optimization or guaranteed outcomes</li>
            </ul>
          </Section>

          <p style={footer}>
            WealthyAI provides structured awareness — not control.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===== SHARED COMPONENT ===== */

function Section({ title, children }) {
  return (
    <div style={section}>
      <h2 style={sectionTitle}>{title}</h2>
      <div style={sectionText}>{children}</div>
    </div>
  );
}

/* ===== STYLES ===== */

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
};

const intro = {
  color: "#e5e7eb",
  maxWidth: 720,
  marginBottom: 32,
  fontSize: 15,
};

const section = {
  width: "100%",
  marginBottom: 28,
  padding: 24,
  borderRadius: 16,
  background: "rgba(56,189,248,0.14)",
  border: "1px solid rgba(125,211,252,0.35)",
  backdropFilter: "blur(12px)",
  boxSizing: "border-box", // Fontos mobilon a padding miatt
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
  fontSize: 14,
  color: "#e5e7eb",
  maxWidth: 720,
};
