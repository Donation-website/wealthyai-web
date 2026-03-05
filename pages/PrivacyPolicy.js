import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div style={page}>
      {/* FUTURISTIC BACKGROUND */}
      <div style={bgGrid} />
      <div style={bgLines} />
      <div style={bgGlow} />

      <div style={content}>
        <div style={container}>
          <button onClick={() => window.history.back()} style={back}>
            ← Back
          </button>

          <h1 style={title}>Privacy Policy</h1>

          <p style={intro}>
            WealthyAI is designed with a <strong>privacy-by-architecture</strong> principle. 
            Our system minimizes data collection and avoids centralized storage of user information wherever possible.
          </p>

          <Section title="1. Data Controller">
            WealthyAI operates the platform and acts as the data controller for any minimal technical data that may be processed.
            <br /><br />
            <strong>For privacy-related inquiries:</strong><br />
            Email: <a href="mailto:info@mywealthyai.com" style={{color: '#38bdf8'}}>info@mywealthyai.com</a>
          </Section>

          <Section title="2. Zero-Storage Architecture">
            WealthyAI does not require user registration and does not store personal financial data on servers.
            User-provided information entered into the system:
            <ul style={list}>
              <li>remains within the user's browser environment</li>
              <li>is stored locally using browser storage mechanisms</li>
              <li>is not persisted on WealthyAI servers</li>
            </ul>
            When a session ends or local storage is cleared, the information is removed from the user's device.
          </Section>

          <Section title="3. Real-Time AI Processing">
            User inputs may be processed temporarily to generate contextual interpretations. This processing:
            <ul style={list}>
              <li>occurs in real time and is ephemeral</li>
              <li>is not stored after the interpretation is generated</li>
              <li>is not used to train global AI models</li>
            </ul>
            The system is designed to forget inputs immediately after processing.
          </Section>

          <Section title="4. Technical and Security Data">
            To maintain platform security, limited technical metadata may be processed temporarily (IP address, browser metadata, timestamps).
            <br /><br />
            Security infrastructure is hosted using <strong>Microsoft Azure</strong> enterprise cloud infrastructure.
          </Section>

          <Section title="5. Payments">
            Payments are processed securely by <strong>Stripe</strong>. WealthyAI does not store credit card information or have access to full payment details.
          </Section>

          <Section title="6. Cookies and Local Storage">
            WealthyAI uses browser local storage for functionality. This data remains on your device and is not transmitted to our servers for storage.
          </Section>

          <Section title="7. Legal Basis & User Rights (GDPR)">
            For EU users, processing is based on legitimate interest (security) and contractual necessity. 
            You have the right to access, correct, or request deletion of data. 
            Note: Since we do not maintain persistent databases, many requests may not apply in practice.
          </Section>

          <p style={footerText}>
            © 2026 WealthyAI — Decentralized Intelligence
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===== COMPONENTS & STYLES ===== */

function Section({ title, children }) {
  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      <div style={sectionText}>{children}</div>
    </div>
  );
}

const page = {
  position: "relative",
  minHeight: "100vh",
  background: "#020617",
  overflowX: "hidden",
  fontFamily: "Inter, system-ui, sans-serif",
  color: "#ffffff",
};

const content = {
  position: "relative",
  zIndex: 10,
  padding: "40px 20px",
  display: "flex",
  justifyContent: "center",
};

const container = {
  width: "100%",
  maxWidth: "800px",
};

const bgGrid = {
  position: "fixed",
  inset: 0,
  backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
  backgroundSize: "80px 80px",
  zIndex: 1,
};

const bgLines = {
  position: "fixed",
  inset: 0,
  backgroundImage: "linear-gradient(120deg, transparent 40%, rgba(56,189,248,0.08) 50%, transparent 60%)",
  backgroundSize: "1200px 1200px",
  zIndex: 2,
};

const bgGlow = {
  position: "fixed",
  inset: 0,
  background: "radial-gradient(circle at 30% 20%, rgba(56,189,248,0.12), transparent 40%), radial-gradient(circle at 70% 80%, rgba(167,139,250,0.12), transparent 45%)",
  zIndex: 3,
};

const back = {
  marginBottom: 24,
  padding: "8px 16px",
  fontSize: 13,
  borderRadius: 8,
  background: "rgba(148,163,184,0.15)",
  border: "1px solid rgba(148,163,184,0.3)",
  color: "#ffffff",
  cursor: "pointer",
  transition: "0.2s",
};

const title = {
  fontSize: "2.5rem",
  fontWeight: "700",
  marginBottom: 16,
  letterSpacing: "-0.02em",
};

const intro = {
  color: "#94a3b8",
  fontSize: "1.1rem",
  lineHeight: "1.6",
  marginBottom: "40px",
};

const sectionStyle = {
  marginBottom: "24px",
  padding: "24px",
  borderRadius: "16px",
  background: "rgba(15, 23, 42, 0.6)",
  border: "1px solid rgba(56, 189, 248, 0.2)",
  backdropFilter: "blur(12px)",
};

const sectionTitleStyle = {
  fontSize: "1.2rem",
  color: "#38bdf8",
  marginBottom: "12px",
  fontWeight: "600",
};

const sectionText = {
  fontSize: "0.95rem",
  lineHeight: "1.7",
  color: "#cbd5e1",
};

const list = {
  marginTop: "10px",
  paddingLeft: "20px",
};

const footerText = {
  marginTop: "60px",
  textAlign: "center",
  fontSize: "0.85rem",
  color: "#475569",
  letterSpacing: "0.05em",
};
