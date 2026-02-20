import React from 'react';
import CommentSystem from '../components/CommentSystem';

export default function Blog() {
  return (
    <div style={pageStyle}>
      <div style={backgroundLayer} />
      <div style={contentWrapper}>
        <div style={container}>
          <button onClick={() => window.location.href = "/"} style={backBtn}>← Back</button>

          <header style={{ marginBottom: '40px' }}>
            <h1 style={mainTitle}>The WealthyAI Genesis</h1>
            <p style={subTitle}>February 20, 2026 • Vlog #1</p>
          </header>

          <div style={articleCard}>
            <p style={leadText}>"We didn’t build WealthyAI to tell people what to do with their money."</p>
            
            <div style={bodyText}>
              <h3 style={stepTitle}>01. Visualizing Fragility</h3>
              <img src="/wealthyai/icons/blog1.jpg" alt="Fragility" style={imageStyle} />
              <p>Why are we showing you a fragility score? Because balance doesn't show breakability.</p>

              <h3 style={stepTitle}>02. The AI Interpretation</h3>
              <img src="/wealthyai/icons/blog2.jpg" alt="Interpretation" style={imageStyle} />
              <p>Our AI builds buffers against market fluctuations by analyzing your unique DNA.</p>

              <h3 style={stepTitle}>03. Strategic Path</h3>
              <img src="/wealthyai/icons/blog3.jpg" alt="Roadmap" style={imageStyle} />
              <p>The 90-day direction: cash reserve management and energy exposure mitigation.</p>
            </div>
          </div>

          <CommentSystem />
        </div>
      </div>
    </div>
  );
}

const pageStyle = { minHeight: "100vh", backgroundColor: "#020617", position: "relative", fontFamily: "Inter, sans-serif", color: "white" };
const backgroundLayer = { position: "fixed", inset: 0, backgroundImage: `repeating-linear-gradient(-25deg, rgba(56,189,248,0.07) 0px, rgba(56,189,248,0.07) 1px, transparent 1px, transparent 160px), url("/wealthyai/icons/generated.png")`, backgroundSize: "auto, 420px auto", zIndex: 1 };
const contentWrapper = { position: "relative", zIndex: 10, padding: "60px 20px" };
const container = { maxWidth: "800px", margin: "0 auto" };
const mainTitle = { fontSize: "2.8rem", fontWeight: "800" };
const subTitle = { color: "#38bdf8", letterSpacing: "2px", fontSize: "11px", textTransform: "uppercase" };
const articleCard = { background: "rgba(15,23,42,0.65)", padding: "40px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" };
const leadText = { fontSize: "1.3rem", fontStyle: "italic", marginBottom: "30px", borderLeft: "4px solid #38bdf8", paddingLeft: "20px" };
const stepTitle = { color: "#38bdf8", fontSize: "1.1rem", marginTop: "40px", marginBottom: "15px" };
const imageStyle = { width: "100%", borderRadius: "12px", marginBottom: "15px", border: "1px solid rgba(56,189,248,0.2)" };
const bodyText = { lineHeight: "1.7", fontSize: "1.1rem", opacity: 0.9 };
const backBtn = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", marginBottom: "20px" };
