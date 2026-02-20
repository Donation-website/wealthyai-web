import React from 'react';
import CommentSystem from '../components/CommentSystem';

export default function Blog() {
  return (
    <div style={pageStyle}>
      {/* DINAMIKUS HÁTTÉR - A KÓDODBÓL ÁTVÉVE */}
      <div style={backgroundLayer} />
      
      <div style={contentWrapper}>
        <div style={container}>
          <button onClick={() => window.location.href = "/"} style={backBtn}>← Back</button>

          <header style={{ marginBottom: '40px' }}>
            <h1 style={mainTitle}>The WealthyAI Genesis</h1>
            <p style={subTitle}>Vlog #1 • System Interpretation</p>
          </header>

          <div style={articleCard}>
            <p style={leadText}>"Interpretation over advice. Clarity over certainty."</p>
            <div style={bodyText}>
              <p>We are building a system that understands the <strong>fragility</strong> of financial structures.</p>
              <img src="/wealthyai/icons/blog1.jpg" alt="Vlog" style={imageStyle} />
              <p>This isn't about numbers. It's about context. How much pressure can your system take before it breaks?</p>
            </div>
          </div>

          {/* SAJÁT KOMMENT RENDSZER BEILLESZTÉSE */}
          <CommentSystem />

          <footer style={footerStyle}>© 2026 WealthyAI Intelligence</footer>
        </div>
      </div>
    </div>
  );
}

// STYLING - A USERDASHBOARD STÍLUSAI ALAPJÁN
const pageStyle = { 
  minHeight: "100vh", 
  backgroundColor: "#020617", 
  position: "relative", 
  fontFamily: "Inter, sans-serif",
  color: "white",
  overflowX: "hidden"
};

const backgroundLayer = {
  position: "fixed",
  inset: 0,
  backgroundImage: `
    repeating-linear-gradient(-25deg, rgba(56,189,248,0.07) 0px, rgba(56,189,248,0.07) 1px, transparent 1px, transparent 160px),
    radial-gradient(circle at 20% 30%, rgba(56,189,248,0.15), transparent 40%),
    url("/wealthyai/icons/generated.png")
  `,
  backgroundSize: "auto, 100% 100%, 420px auto",
  zIndex: 1
};

const contentWrapper = { position: "relative", zIndex: 10, padding: "60px 20px" };
const container = { maxWidth: "800px", margin: "0 auto" };
const mainTitle = { fontSize: "2.5rem", fontWeight: "800", marginBottom: "10px" };
const subTitle = { color: "#38bdf8", letterSpacing: "2px", fontSize: "12px", textTransform: "uppercase" };
const articleCard = { 
  background: "rgba(15,23,42,0.65)", 
  padding: "40px", 
  borderRadius: "24px", 
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(10px)"
};
const leadText = { fontSize: "1.2rem", fontStyle: "italic", marginBottom: "20px", opacity: 0.9 };
const bodyText = { lineHeight: "1.7", fontSize: "1.1rem", opacity: 0.8 };
const imageStyle = { width: "100%", borderRadius: "15px", margin: "25px 0", border: "1px solid rgba(56,189,248,0.3)" };
const backBtn = { background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", marginBottom: "20px" };
const footerStyle = { textAlign: "center", marginTop: "50px", opacity: 0.4, fontSize: "12px" };
