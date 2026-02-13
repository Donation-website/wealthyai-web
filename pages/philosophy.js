import React, { useEffect } from 'react';

export default function Philosophy() {
  // Automatikusan az oldal tetejére ugrik betöltéskor
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

          <h1 style={title}>The WealthyAI Philosophy</h1>

          <p style={intro}>
            We didn’t build WealthyAI to tell you what to do with your money. 
            <strong> We built it to help you think.</strong>
          </p>

          {/* MOBILBARÁT VIDEÓ KONTÉNER */}
          <div style={videoWrapper}>
             <video 
                width="100%" 
                controls 
                autoPlay 
                muted 
                playsInline
                style={videoStyle}
             >
                <source src="/wealthyai/icons/Ready.mp4" type="video/mp4" />
                Your browser does not support the video tag.
             </video>
          </div>

          <Section title="Interpretation, Not Advice">
            WealthyAI was built around a different question: What happens if AI doesn’t advise — but interprets? 
            We don't offer faster decisions or better predictions, but <strong>clearer thinking</strong>.
          </Section>

          <Section title="Why it is time-based">
            Financial insight changes when context changes, and context changes with time. 
            WealthyAI doesn’t reward speed. <strong>It rewards attention.</strong>
            <ul style={listStyle}>
              <li>Snapshots show where you are — without narrative.</li>
              <li>Monthly intelligence follows continuity helyett chasing novelty.</li>
            </ul>
          </Section>

          <Section title="What it is NOT">
            <ul style={listStyle}>
              <li>It is not financial advice.</li>
              <li>It is not forecasting.</li>
              <li>It does not optimize your life.</li>
            </ul>
            WealthyAI assumes that you remain responsible for decisions — it simply gives you a clearer frame to make them.
          </Section>

          <Section title="Who it’s for">
            This system resonates most with those who are tired of oversimplified answers, 
            don’t want to be sold certainty, and <strong>value continuity over instant output</strong>.
          </Section>

          <p style={footer}>
            WealthyAI is not trying to replace human judgment. It exists to support it — quietly, over time.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===== KOMPONENSEK ÉS STÍLUSOK ===== */

function Section({ title, children }) {
  return (
    <div style={section}>
      <h2 style={sectionTitle}>{title}</h2>
      <div style={sectionText}>{children}</div>
    </div>
  );
}

const page = {
  position: "relative",
  minHeight: "100vh",
  background: "#020617",
  overflowX: "hidden",
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  color: "#ffffff",
};

const content = {
  position: "relative",
  zIndex: 10,
  padding: "40px 15px", // Kisebb padding mobilon
  display: "flex",
  justifyContent: "center",
};

const container = {
  width: "100%",
  maxWidth: "800px",
};

const videoWrapper = {
  width: "100%",
  marginBottom: "40px",
  borderRadius: "16px",
  overflow: "hidden",
  background: "#000",
  border: "1px solid rgba(56,189,248,0.3)",
  boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
};

const videoStyle = {
  display: "block",
  width: "100%",
  height: "auto",
};

const title = {
  fontSize: "clamp(2rem, 8vw, 3rem)", // Dinamikus méret: mobilon kisebb, asztalin nagyobb
  fontWeight: "800",
  marginBottom: "16px",
  letterSpacing: "-0.02em",
  lineHeight: "1.1",
};

const intro = {
  color: "#94a3b8",
  marginBottom: "40px",
  fontSize: "clamp(1rem, 4vw, 1.15rem)",
  lineHeight: "1.6",
};

const section = {
  marginBottom: "24px",
  padding: "24px",
  borderRadius: "20px",
  background: "rgba(15, 23, 42, 0.7)",
  border: "1px solid rgba(56,189,248,0.2)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)", // Safari támogatás
};

const sectionTitle = {
  fontSize: "1.1rem",
  fontWeight: "600",
  color: "#38bdf8",
  marginBottom: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const sectionText = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#e2e8f0",
};

const listStyle = {
  paddingLeft: "20px",
  marginTop: "10px",
};

const footer = {
  marginTop: "60px",
  padding: "30px 0",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  fontSize: "14px",
  fontStyle: "italic",
  color: "#64748b",
  textAlign: "center",
};

/* HÁTTÉR ELEMEK */
const bgGrid = {
  position: "fixed",
  inset: 0,
  backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
  backgroundSize: "60px 60px",
  zIndex: 1,
};

const bgLines = {
  position: "fixed",
  inset: 0,
  backgroundImage: "linear-gradient(120deg, transparent 40%, rgba(56,189,248,0.05) 50%, transparent 60%)",
  backgroundSize: "1000px 1000px",
  zIndex: 2,
};

const bgGlow = {
  position: "fixed",
  inset: 0,
  background: "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.1), transparent 40%), radial-gradient(circle at 80% 80%, rgba(167,139,250,0.1), transparent 40%)",
  zIndex: 3,
};

const back = {
  marginBottom: "20px",
  padding: "8px 14px",
  fontSize: "12px",
  borderRadius: "8px",
  background: "rgba(148,163,184,0.15)",
  border: "1px solid rgba(148,163,184,0.3)",
  color: "#ffffff",
  cursor: "pointer",
};
