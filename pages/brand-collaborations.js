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
        {/* FUTURISTIC BACKGROUND - From BasicHelpPage */}
        <div style={bgGrid} />
        <div style={bgLines} />
        <div style={bgGlow} />

        <div style={{
          ...content,
          padding: isMobile ? "40px 20px" : "80px 40px"
        }}>
          <div style={container}>
            <button 
              onClick={() => window.history.back()} 
              style={back}
            >
              ← Back
            </button>

            <h1 style={{
              ...title,
              fontSize: isMobile ? "2rem" : "2.8rem"
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
              We offer focused access to a refined, high-net-worth demographic.
            </Section>

            <Section title="Integration Tiers">
              We offer bespoke placement opportunities within our interface, 
              designed to feel like a native extension of the platform rather 
              than an interruption. 
              <br /><br />
              <em style={{ color: "#38bdf8" }}>Currently, we are reviewing applications for the upcoming cycle.</em>
            </Section>

            <div style={contactBox}>
              <h2 style={{ fontSize: "1.3rem", marginBottom: "12px" }}>Partnership Inquiries</h2>
              <p style={{ margin: 0 }}>
                Direct proposals to: <a href="mailto:info@mywealthyai.com" style={link}>info@mywealthyai.com</a>
              </p>
              <p style={{ fontSize: "0.85rem", marginTop: "16px", opacity: 0.7 }}>
                Please include a brief overview of your brand and proposed value proposition.
              </p>
            </div>

            <div style={footerContainer}>
              <p style={footerText}>
                WealthyAI reserves the right to decline any partnership that does not 
                meet our internal quality and ethical benchmarks.
              </p>
              <p style={copyright}>
                © 2026 mywealthyai.com — All rights reserved.
              </p>
            </div>
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

/* ===== STYLES (Synchronized with your Background) ===== */

const page = {
  position: "relative",
  minHeight: "100vh",
  background: "#020617", // Mélykék háttér
  overflowX: "hidden",
  fontFamily: "Inter, system-ui",
  color: "#ffffff",
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
  color: "#ffffff",
};

const intro = {
  color: "#cbd5e1",
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
  background: "rgba(56,189,248,0.14)", // Kékebb áttetszőség
  border: "1px solid rgba(125,211,252,0.35)",
  backdropFilter: "blur(12px)",
  boxSizing: "border-box",
};

const sectionTitle = {
  fontSize: "1.15rem",
  color: "#f0f9ff",
  marginBottom: 10,
  fontWeight: "600",
};

const sectionText = {
  fontSize: 15,
  lineHeight: 1.7,
  color: "#f8fafc",
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

const footerContainer = {
  marginTop: 48,
  textAlign: "center",
};

const footerText = {
  fontSize: 13,
  color: "#94a3b8",
  fontStyle: "italic",
  marginBottom: 16,
};

const copyright = {
  fontSize: 12,
  color: "#64748b",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  paddingTop: 16,
  letterSpacing: "0.05em",
};
