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
          padding: isMobile ? "20px 15px" : "40px",
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
            Understanding Your Financial Overview
          </h1>

          <p style={intro}>
            This page explains how to read and use the information shown on your
            Financial Overview screen.  
            The purpose is orientation and clarity — not evaluation, pressure,
            or judgment.
          </p>

          <Section title="How to Access Premium Features" isMobile={isMobile}>
            Getting started with <strong>MyWealthyAI</strong> is seamless. Since we value your privacy, we don’t use traditional accounts or passwords.
            <br /><br />
            <strong>1. Choose Your Plan:</strong> Select from our 1-Day, 1-Week, or 1-Month access packages.
            <br />
            <strong>2. Secure Payment:</strong> You will be redirected to <strong>Stripe</strong>. Please ensure you provide a <strong>valid email address</strong> during checkout.
            <br />
            <strong>3. Receive Your Priority Code:</strong> Check your inbox (and <strong>Spam folder</strong>) for your unique <strong>Stripe Priority Code</strong>.
            <br />
            <strong>4. Unlock & Explore:</strong> Return to the site, click your chosen plan, enter the code into the <strong>"Enter code"</strong> field, and hit <strong>Validate</strong>.
            <br /><br />
            <em>Note: Your access starts from the moment of purchase. Keep your code safe, as you will need it to re-enter if you close your session.</em>
          </Section>

          <Section title="What this page shows" isMobile={isMobile}>
            The Financial Overview is a <strong>basic snapshot</strong> of your
            current financial situation.
            <br /><br />
            It helps you understand the relationship between your income,
            expenses, and overall balance at a glance — without requiring
            detailed tracking or long-term planning.
          </Section>

          <Section title="What the numbers represent" isMobile={isMobile}>
            The values you enter are grouped into simple categories:
            <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
              <li><strong>Monthly Income</strong> – how much money you bring in</li>
              <li><strong>Fixed Expenses</strong> – costs that stay mostly the same</li>
              <li><strong>Variable Expenses</strong> – costs that change month to month</li>
            </ul>
            <br />
            From these, the system calculates your remaining balance and basic
            financial ratios.
          </Section>

          <Section title="How to read the visual indicators" isMobile={isMobile}>
            <p>
              <strong>Radar Diagram</strong><br />
              This visual compares expense load, savings strength, and
              subscription weight.
              It is meant to show proportion, not precision.
            </p>

            <p style={{ marginTop: "15px" }}>
              <strong>Risk Level</strong><br />
              A simple indicator based on how much of your income is used by
              expenses.
              It is not a prediction — only a signal.
            </p>

            <p style={{ marginTop: "15px" }}>
              <strong>Savings Score</strong><br />
              A relative measure of how much room you currently have to save.
              Higher is generally more resilient.
            </p>
          </Section>

          <Section title="What this view does NOT do" isMobile={isMobile}>
            <ul style={{ paddingLeft: "20px" }}>
              <li>It does not track daily behavior</li>
              <li>It does not analyze habits over time</li>
              <li>It does not replace budgeting tools</li>
              <li>It does not provide financial advice</li>
            </ul>
          </Section>

          <Section title="How to use this page effectively" isMobile={isMobile}>
            Use this overview when you want to:
            <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
              <li>quickly check financial balance</li>
              <li>understand pressure points</li>
              <li>decide whether deeper analysis is needed</li>
            </ul>
            <br />
            If you are looking for patterns, behavior, or trends,
            deeper intelligence levels are more suitable.
          </Section>

          <Section title="Moving beyond the overview" isMobile={isMobile}>
            This page shows <strong>where you stand</strong>.
            <br /><br />
            Daily, weekly, and monthly intelligence layers focus on
            <strong>how you got there</strong> and <strong>where things are heading</strong>.
          </Section>

          <p style={footer}>
            WealthyAI is designed to support awareness — not control.
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
        padding: isMobile ? "20px" : "24px",
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
