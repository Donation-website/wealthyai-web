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

      <div
        style={{
          ...content,
          padding: isMobile ? "20px 15px" : 40,
        }}
      >
        <div style={container}>
          <button onClick={() => window.history.back()} style={back}>
            ← Back
          </button>

          <h1
            style={{
              ...title,
              fontSize: isMobile ? "1.8rem" : "2.2rem",
            }}
          >
            How Monthly Financial Intelligence Works
          </h1>

          <p style={intro}>
            This page explains how to use the Monthly Intelligence view in WealthyAI.
            The purpose is long-range clarity — not optimization, not control.
          </p>

          <Section title="What this page is" isMobile={isMobile}>
            The monthly view provides <strong>strategic financial intelligence</strong>.
            <br /><br />
            It is designed to surface pressure, structure, and direction
            across a longer time horizon — not daily noise.
            <br /><br />
            Nothing here updates automatically unless you ask for it.
          </Section>

          <Section title="Daily signal vs monthly briefing" isMobile={isMobile}>
            These are <strong>not the same thing</strong>.
            <br /><br />
            <strong>Daily Signal</strong>
            <ul>
              <li>One short sentence</li>
              <li>Appears once per day, at a random time</li>
              <li>Designed to create rhythm and awareness</li>
              <li>Cannot be exported, emailed, or edited</li>
              <li>Disappears with time</li>
            </ul>
            <br />
            <strong>Monthly Briefing</strong>
            <ul>
              <li>Full strategic analysis</li>
              <li>Generated only when you click “Generate Monthly Briefing”</li>
              <li>Always dual-lens (Executive / Directive)</li>
              <li>Exists only in the current session unless saved</li>
            </ul>
          </Section>

          <Section title="Snapshots (important)" isMobile={isMobile}>
            Monthly briefings are <strong>temporary by default</strong>.
            <br /><br />
            If you close the page or generate a new briefing without saving,
            the previous analysis is lost.
            <br /><br />
            To preserve a briefing:
            <ul>
              <li>Click <strong>Save Today’s Snapshot</strong></li>
              <li>Saved snapshots appear under <strong>View past days</strong></li>
              <li>Each snapshot represents one specific day in your monthly cycle</li>
            </ul>
            <br />
            Saved snapshots can be revisited later and shared or exported if needed.
            <br /><br />
            This behavior is intentional.
          </Section>

          <Section title="Why nothing is saved automatically" isMobile={isMobile}>
            Financial intelligence loses value when it becomes something you stop noticing.
            <br /><br />
            By requiring intentional saving:
            <ul>
              <li>you decide what matters</li>
              <li>patterns emerge over time</li>
              <li>important signals remain clear</li>
            </ul>
            <strong>If everything were saved, nothing would stand out.</strong>
          </Section>

          <Section title="Returning daily" isMobile={isMobile}>
            You are not expected to act every day.
            <br /><br />
            Returning daily allows subtle shifts to become visible,
            pressure to surface before urgency,
            and direction to clarify gradually.
            <br /><br />
            The system is quiet by design.
          </Section>

          <Section title="What this system does NOT do" isMobile={isMobile}>
            <ul>
              <li>It does not provide financial advice</li>
              <li>It does not optimize budgets</li>
              <li>It does not track behavior</li>
              <li>It does not notify or interrupt you</li>
            </ul>
          </Section>

          <p style={footer}>
            WealthyAI provides awareness — not control.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===== SECTION COMPONENT ===== */

function Section({ title, children, isMobile }) {
  return (
    <div
      style={{
        ...section,
        padding: isMobile ? "20px" : 24,
      }}
    >
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
};

const intro = {
  color: "#e5e7eb",
  maxWidth: 720,
  marginBottom: 32,
  fontSize: 15,
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
