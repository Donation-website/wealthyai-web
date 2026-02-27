import React, { useState, useEffect } from "react";
import Head from "next/head";

export default function BrandCollaborations() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <Head>
        <title>Brand Collaborations | WealthyAI</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={page}>
        {/* BACKGROUND LAYER - Consistent with Main UI */}
        <div style={bgGrid} />
        <div style={bgLines} />
        <div style={bgGlow} />

        <div style={{
          ...content,
          padding: isMobile ? "80px 20px 60px 20px" : "100px 40px"
        }}>
          <div style={container}>
            <button 
              onClick={() => window.history.back()} 
              style={back}
              onMouseEnter={(e) => e.target.style.background = "rgba(148,163,184,0.3)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(148,163,184,0.18)"}
            >
              ← Back
            </button>

            <h1 style={{
              ...title,
              fontSize: isMobile ? "2.2rem" : "3.5rem",
              background: "linear-gradient(to right, #ffffff, #94a3b8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em"
            }}>Brand Collaborations</h1>

            <p style={intro}>
              WealthyAI is an exclusive environment for high-intent individuals. 
              We do not display traditional advertisements; we curate strategic 
              partnerships that provide genuine value to our sophisticated ecosystem.
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
              We offer focused access to a refined, high-net-worth demographic 
              rather than mass-market reach.
            </Section>

            <Section title="Integration Tiers">
              We offer bespoke placement opportunities within our interface, 
              designed to feel like a native extension of the platform rather 
              than an interruption. 
              <br /><br />
              <em style={{ color: "#38bdf8" }}>Currently, we are reviewing applications for the upcoming cycle.</em>
            </Section>

            <div style={contactBox}>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "12px", fontWeight: "600" }}>Partnership Inquiries</h2>
              <p style={{ margin: 0, fontSize: "1.1rem" }}>
                Direct proposals to: <a href="mailto:info@mywealthyai.com" style={link}>info@mywealthyai.com</a>
              </p>
              <p style={{ fontSize: "0.85rem", marginTop: "16px", opacity: 0.6, lineHeight: "1.5" }}>
                Please include a brief overview of your brand and <br /> your proposed value proposition.
              </p>
            </div>

            <p style={footer}>
              WealthyAI reserves the right to decline any partnership that does not 
              meet our internal quality and ethical benchmarks.
            </p>
          </div>
        </div>
      </div>
    </>
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

/* ===== STYLES (Synchronized with WealthyAI UI) ===== */

const page = {
  position: "relative",
  minHeight: "100vh",
  background: "#060b13", // A főoldal sötétje
  overflowX: "hidden",
  fontFamily: "'Inter', system-ui, sans-serif",
  color: "#ffffff",
};

const bgGrid = {
  position: "fixed",
  inset: 0,
  backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
  backgroundSize: "60px 60px",
  zIndex: 1,
};

const bgLines = {
  position: "fixed",
  inset: 0,
  backgroundImage: "linear-gradient(120deg, transparent 40%, rgba(56,189,248,0.03) 50%, transparent 60%)",
  backgroundSize: "100% 100%",
  zIndex: 2,
};

const bgGlow = {
  position: "fixed",
  inset: 0,
  background: "radial-gradient(circle at 10% 10%, rgba(56,189,248,0.05), transparent 40%), radial-gradient(circle at 90% 90%, rgba(167,139,250,0.05), transparent 45%)",
  zIndex: 3,
};

const content = {
  position: "relative",
  zIndex: 10,
  display: "flex",
  justifyContent: "center",
};

const container = {
  width: "100%",
  maxWidth: "700px",
};

const back = {
  marginBottom: 32,
  padding: "8px 16px",
  fontSize: 13,
  borderRadius: "8px",
  background: "rgba(148,163,184,0.18)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#ffffff",
  cursor: "pointer",
  transition: "all 0.3s ease",
  fontWeight: "500",
};

const title = {
  marginBottom: 24,
  fontWeight: "800",
};

const intro = {
  color: "#94a3b8",
  marginBottom: 48,
  fontSize: "1.2rem",
  lineHeight: "1.6",
  fontWeight: "300",
};

const section = {
  width: "100%",
  marginBottom: 30,
  padding: "32px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.05)",
  backdropFilter: "blur(20px)",
  boxSizing: "border-box",
};

const sectionTitle = {
  fontSize: "0.9rem",
  color: "#38bdf8",
  marginBottom: 14,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  fontWeight: "700",
};

const sectionText = {
  fontSize: "1.05rem",
  lineHeight: "1.7",
  color: "#cbd5e1",
  fontWeight: "300",
};

const contactBox = {
  marginTop: 60,
  padding: "40px",
  borderRadius: "24px",
  background: "linear-gradient(135deg, rgba(56,189,248,0.05), rgba(167,139,250,0.05))",
  border: "1px solid rgba(56,189,248,0.2)",
  textAlign: "center",
  color: "#ffffff"
};

const link = {
  color: "#38bdf8",
  textShadow: "0 0 15px rgba(56,189,248,0.4)",
  textDecoration: "none",
  fontWeight: "600"
};

const footer = {
  marginTop: 60,
  fontSize: "0.75rem",
  color: "#475569",
  textAlign: "center",
  fontStyle: "italic",
  letterSpacing: "0.02em"
};
