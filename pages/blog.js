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
            <p style={subTitle}>Vlog #1 • 2026</p>
          </header>

          <div style={articleCard}>
            <p style={leadText}>"We didn’t build WealthyAI to tell people what to do with their money. We built it to show them what's happening."</p>
            
            <div style={bodyText}>
              <h3 style={stepTitle}>01. Visualizing Fragility</h3>
              <img src="/wealthyai/icons/blog1.jpg" alt="B1" style={imageStyle} />
              <p>Traditional systems look at balances. We look at the strength of those balances under pressure.</p>

              <h3 style={stepTitle}>02. System Interpretation</h3>
              <img src="/wealthyai/icons/blog2.jpg" alt="B2" style={imageStyle} />
              <p>The AI filters noise. It doesn't give orders, it provides a lens for better human judgment.</p>

              <h3 style={stepTitle}>03. The Strategic Path</h3>
              <img src="/wealthyai/icons/blog3.jpg" alt="B3" style={imageStyle} />
              <p>Clarity is the ultimate asset. The next 90 days are about stabilization and risk mitigation.</p>
            </div>
          </div>

          <CommentSystem />
        </div>
      </div>
    </div>
  );
}

const pageStyle = { minHeight: "100vh", backgroundColor: "#020617", position: "relative", color: "white" };
const backgroundLayer = { position: "fixed", inset: 0, backgroundImage: `repeating-linear-gradient(-25deg, rgba(56,189,248,0.05) 0px, rgba(56,189,248,0.05) 1px, transparent 1px, transparent 160px), url("/wealthyai/icons/generated.png")`, backgroundSize: "auto, 420px auto", zIndex: 1 };
const contentWrapper = { position: "relative", zIndex: 10, padding: "60px 20px" };
const container = { maxWidth: "800px", margin: "0 auto" };
const mainTitle = { fontSize: "2.8rem", fontWeight: "800", marginBottom: "5px" };
const subTitle = { color: "#38bdf8", letterSpacing: "2px", fontSize: "11px", textTransform: "uppercase", opacity: 0.8 };
const articleCard = { background: "rgba(15,23,42,0.7)", padding: "40px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(15px)" };
const leadText = { fontSize: "1.2rem", fontStyle: "italic", marginBottom: "30px", color: "rgba(255,255,255,0.95)" };
const stepTitle = { color: "#38bdf8", fontSize: "1.1rem", marginTop: "40px", marginBottom: "15px", fontWeight: "700" };
const imageStyle = { width: "100%", borderRadius: "12px", marginBottom: "20px", border: "1px solid rgba(56,189,248,0.2)" };
const bodyText = { lineHeight: "1.7", fontSize: "1.05rem", opacity: 0.9 };
const backBtn = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", marginBottom: "20px" };
