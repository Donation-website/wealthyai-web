import React, { useState, useEffect } from "react";

export default function Terms() {
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
          }}>Terms & Principles</h1>

          <p style={intro}>
            WealthyAI is an informational system designed to support
            financial awareness and structured understanding through 
            autonomous interpretation.
          </p>

          <Section title="Nature of the information">
            All insights are generated from user-provided inputs
            and contextual models. 
            <br /><br />
            They do not constitute financial, legal, tax,
            or investment advice. WealthyAI is not a financial advisor 
            and does not manage assets.
          </Section>

          <Section title="Privacy by Architecture (Zero-Storage)">
            WealthyAI is built on a zero-server principle. 
            <br /><br />
            We do not require registration. We do not store your financial data, 
            your identity, or your history on any database. Your information 
            lives exclusively in your browser's local storage. When you close 
            your session or clear your cache, your data remains yours alone.
          </Section>

          <Section title="AI Interpretation vs. Training">
            Your structural data is processed in real-time to provide context, 
            but it is never used to train global AI models. We use an 
            ephemeral inference process that forgets inputs the moment 
            the briefing is generated.
          </Section>

          <Section title="Payments and security">
            Payments are securely processed through Stripe. 
            <br /><br />
            WealthyAI does not store credit card information 
            or sensitive payment data. Stripe handles the transaction, 
            and we only receive a success signal to unlock your intelligence cycle.
          </Section>

          <Section title="User responsibility">
            Users remain fully responsible for how insights are interpreted
            and applied. 
            <br /><br />
            WealthyAI supports awareness and perspective — 
            not autonomous decision-making. We provide the frame; 
            you make the choice.
          </Section>

          <p style={footer}>
            Transparency over promises. Understanding over control.
            <br />
            © 2026 WealthyAI — Decentralized Intelligence.
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
  fontSize: 14,
  color: "#e5e7eb",
  maxWidth: 720,
  lineHeight: 2,
};
