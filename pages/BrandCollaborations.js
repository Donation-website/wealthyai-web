import React, { useState, useEffect } from "react";

export default function BrandCollaborations() {
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
            fontSize: isMobile ? "1.8rem" : "2.5rem",
            background: "linear-gradient(to right, #fff, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>Brand Collaborations</h1>

          <p style={intro}>
            WealthyAI is a sanctuary for high-intent individuals. 
            We do not display advertisements; we curate strategic partnerships 
            that provide genuine value to our ecosystem.
          </p>

          <Section title="Exclusivity by Design">
            To maintain the integrity of our user experience, we only accept 
            a strictly limited number of partners per quarter. 
            Every collaboration is hand-selected to ensure it aligns with the 
            financial aspirations and aesthetic standards of our community.
          </Section>

          <Section title="Audience Profile">
            Our users are characterized by their deliberate approach to wealth 
            and clarity. They value precision, privacy, and high-tier services. 
            We do not offer mass-market reach; we offer focused access to a 
            refined demographic.
          </Section>

          <Section title="Integration Tiers">
            We offer bespoke placement opportunities within our interface, 
            designed to feel like a native extension of the platform rather 
            than an interruption. 
            <br /><br />
            <em>Currently, we are reviewing applications for the upcoming cycle.</em>
          </Section>

          <div style={contactBox}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>Inquiries</h2>
            <p style={{ margin: 0 }}>
              Direct proposals to: <a href="mailto:info@mywealthyai.co" style={link}>info@mywealthyai.co</a>
            </p>
            <p style={{ fontSize: "0.8rem", marginTop: "12px", opacity: 0.7 }}>
              Please include a brief overview of your brand and proposed value proposition.
            </p>
          </div>

          <p style={footer}>
            WealthyAI reserves the right to decline any partnership that does not 
            meet our internal quality benchmarks.
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

/* ===== STYLES (Synchronized with your UI) ===== */

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
  maxWidth: 800,
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
  padding: "6px 12px",
  fontSize: 13,
  borderRadius: 8,
  background: "rgba(148,163,184,0.18)",
  border: "1px solid rgba(148,163,184,0.35)",
  color: "#ffffff",
  cursor: "pointer",
};

const title = {
  marginBottom: 16,
  fontWeight: "700",
};

const intro = {
  color: "#94a3b8",
  maxWidth: 720,
  marginBottom: 40,
  fontSize: "1.1rem",
  lineHeight: "1.6",
};

const section = {
  width: "100%",
  marginBottom: 24,
  padding: 24,
  borderRadius: 16,
  background: "rgba(56,189,248,0.05)", // Visszafogottabb kék
  border: "1px solid rgba(125,211,252,0.15)",
  backdropFilter: "blur(12px)",
  boxSizing: "border-box",
};

const sectionTitle = {
  fontSize: "1.1rem",
  color: "#38bdf8", // Világító kék
  marginBottom: 10,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const sectionText = {
  fontSize: 15,
  lineHeight: 1.7,
  color: "#cbd5e1",
};

const contactBox = {
  marginTop: 40,
  padding: "30px",
  borderRadius: 20,
  background: "linear-gradient(135deg, rgba(56,189,248,0.1), rgba(167,139,250,0.1))",
  border: "1px solid rgba(56,189,248,0.3)",
  textAlign: "center",
  color: "#ffffff"
};

const link = {
  color: "#38bdf8",
  textDecoration: "none",
  fontWeight: "bold"
};

const footer = {
  marginTop: 48,
  fontSize: 12,
  color: "#64748b",
  textAlign: "center",
  fontStyle: "italic"
};
