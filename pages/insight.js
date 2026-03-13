import React from "react";

export default function InsightPage() {
  // Ez a tömb lesz majd a Supabase-ből érkező adatok helye
  const articles = []; 

  return (
    <div style={page}>
      {/* FIX FUTURISZTIKUS HÁTTÉR ELEMEK */}
      <div style={bgGrid} />
      <div style={bgLines} />
      <div style={bgGlow} />

      <div style={content}>
        <div style={container}>
          <button onClick={() => window.history.back()} style={back}>
            ← Back
          </button>

          <h1 style={title}>Insights</h1>
          <p style={intro}>
            Structured financial interpretation and intelligence.
          </p>

          {/* DINAMIKUS TARTALOM HELYE */}
          <div style={articleWrapper}>
            {articles.length > 0 ? (
              articles.map((article, index) => (
                <Section key={index} title={article.title}>
                  {article.content}
                </Section>
              ))
            ) : (
              <p style={{ color: "#64748b", fontStyle: "italic" }}>
                No insights published yet. New articles will appear here.
              </p>
            )}
          </div>

          <p style={footer}>
            WealthyAI supports clarity — not pressure.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===== DINAMIKUS SZEKCIÓ KOMPONENS ===== */

function Section({ title, children }) {
  return (
    <div style={section}>
      <h2 style={sectionTitle}>{title}</h2>
      <div style={sectionText}>{children}</div>
    </div>
  );
}

/* ===== STYLES (Konzisztens a többi oldallal) ===== */

const page = {
  position: "relative",
  minHeight: "100vh",
  background: "#020617",
  overflowX: "hidden", // Csak függőleges görgetés engedélyezett
  fontFamily: "Inter, system-ui",
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

const content = {
  position: "relative",
  zIndex: 10,
  padding: "40px 20px",
  display: "flex",
  justifyContent: "center",
};

const container = {
  width: "100%",
  maxWidth: 900,
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
  fontSize: "2.5rem",
  marginBottom: 12,
  color: "#ffffff",
};

const intro = {
  color: "#e5e7eb",
  maxWidth: 720,
  marginBottom: 48,
  fontSize: 16,
};

const articleWrapper = {
  display: "flex",
  flexDirection: "column",
  gap: "24px", // Távolság a cikkek között
};

const section = {
  width: "100%",
  padding: 24,
  borderRadius: 16,
  background: "rgba(56,189,248,0.14)",
  border: "1px solid rgba(125,211,252,0.35)",
  backdropFilter: "blur(12px)",
};

const sectionTitle = {
  fontSize: "1.25rem",
  color: "#f0f9ff",
  marginBottom: 10,
};

const sectionText = {
  fontSize: 15,
  lineHeight: 1.65,
  color: "#f8fafc",
};

const footer = {
  marginTop: 64,
  paddingBottom: 40,
  fontSize: 14,
  color: "#e5e7eb",
  maxWidth: 720,
};
