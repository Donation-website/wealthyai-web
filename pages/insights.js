import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Kapcsolódás a meglévő Supabase adatbázishoz
const SUPABASE_URL = "https://csfaqnsuhhnposhyfxmk.supabase.co";
const SUPABASE_KEY = "sb_publishable_wjDPUzwhkqApZWEHWrvalQ_bSJr8iT0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function InsightPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cikkek lekérése az oldal betöltésekor
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setArticles(data || []);
      } catch (err) {
        console.error("Error fetching insights:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

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
            {loading ? (
              <p style={{ color: "#38bdf8", textAlign: "center" }}>Scanning database...</p>
            ) : articles.length > 0 ? (
              articles.map((article) => (
                <Section 
                  key={article.id} 
                  title={article.title} 
                  image={article.image_url}
                  date={new Date(article.created_at).toLocaleDateString()}
                >
                  {article.content}
                </Section>
              ))
            ) : (
              <p style={{ color: "#64748b", fontStyle: "italic", textAlign: "center" }}>
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

function Section({ title, image, date, children }) {
  return (
    <div style={section}>
      {image && (
        <img 
          src={image} 
          alt={title} 
          style={{ 
            width: "100%", 
            height: "250px", 
            objectFit: "cover", 
            borderRadius: "12px", 
            marginBottom: "20px",
            border: "1px solid rgba(255,255,255,0.1)" 
          }} 
        />
      )}
      <div style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "bold", marginBottom: "8px", textTransform: "uppercase" }}>
        {date}
      </div>
      <h2 style={sectionTitle}>{title}</h2>
      <div style={sectionText}>
        {/* Sortörések megtartása a tartalomnál */}
        <div style={{ whiteSpace: "pre-wrap" }}>{children}</div>
      </div>
    </div>
  );
}

/* ===== STYLES ===== */

const page = {
  position: "relative",
  minHeight: "100vh",
  background: "#020617",
  overflowX: "hidden",
  fontFamily: "Inter, system-ui, sans-serif",
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
  maxWidth: 800,
};

const back = {
  marginBottom: 24,
  padding: "8px 16px",
  fontSize: 13,
  borderRadius: 8,
  background: "rgba(148,163,184,0.12)",
  border: "1px solid rgba(148,163,184,0.25)",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: "bold",
};

const title = {
  fontSize: "3rem",
  fontWeight: "900",
  marginBottom: 12,
  color: "#ffffff",
  letterSpacing: "-1px",
};

const intro = {
  color: "#94a3b8",
  maxWidth: 600,
  marginBottom: 64,
  fontSize: 18,
  lineHeight: "1.6",
};

const articleWrapper = {
  display: "flex",
  flexDirection: "column",
  gap: "32px",
};

const section = {
  width: "100%",
  padding: "32px",
  borderRadius: "24px",
  background: "rgba(15, 23, 42, 0.65)",
  border: "1px solid rgba(56, 189, 248, 0.2)",
  backdropFilter: "blur(16px)",
  boxSizing: "border-box",
};

const sectionTitle = {
  fontSize: "1.5rem",
  color: "#ffffff",
  marginBottom: "16px",
  fontWeight: "700",
};

const sectionText = {
  fontSize: "16px",
  lineHeight: "1.7",
  color: "#cbd5e1",
};

const footer = {
  marginTop: "80px",
  paddingBottom: "40px",
  fontSize: "14px",
  color: "#64748b",
  textAlign: "center",
};
