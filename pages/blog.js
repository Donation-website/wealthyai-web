import React, { useEffect } from 'react';

export default function Blog() {
  useEffect(() => {
    // 1. A fő kommentmező (Disqus Embed)
    const d = document;
    if (!d.getElementById('disqus-embed-script')) {
      const s = d.createElement('script');
      s.id = 'disqus-embed-script';
      s.src = 'https://mywealthyai.disqus.com/embed.js';
      s.setAttribute('data-timestamp', +new Date());
      (d.head || d.body).appendChild(s);
    }

    // 2. A számláló kód, amit kértél (count.js)
    // Ez fut le a "body" vége előtt szimulálva
    if (!d.getElementById('dsq-count-scr')) {
      const sCount = d.createElement('script');
      sCount.id = 'dsq-count-scr';
      sCount.src = '//mywealthyai.disqus.com/count.js';
      sCount.async = true;
      (d.head || d.body).appendChild(sCount);
    }
  }, []);

  return (
    <div style={page}>
      {/* Háttér elemek */}
      <div style={bgGrid} />
      <div style={bgLines} />
      <div style={bgGlow} />

      <div style={content}>
        <div style={container}>
          
          <button onClick={() => window.location.href = "/"} style={back}>
            ← Back to WealthyAI
          </button>

          <header style={{ marginBottom: '60px', position: 'relative', zIndex: 11 }}>
            <h1 style={title}>The WealthyAI Genesis</h1>
            <p style={intro}>
              <span style={{ color: '#38bdf8', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '11px' }}>
                February 20, 2026 • Manifest
              </span>
            </p>
          </header>

          {/* Manifesztum szekció */}
          <div style={section}>
            <p style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '30px', fontWeight: '300', fontStyle: 'italic', lineHeight: '1.4' }}>
              "We didn’t build WealthyAI to tell people what to do with their money."
            </p>

            <div style={sectionText}>
              <p>
                There are already countless tools that promise clarity, certainty, or even wealth. 
                Most of them collapse under their own promises.
              </p>

              <h3 style={{ color: '#f0f9ff', marginTop: '30px', fontSize: '1.3rem' }}>What happens if AI doesn’t advise — but interprets?</h3>
              <p>
                WealthyAI was built around a different question. We are not chasing faster decisions or better predictions. 
                We are building a tool for <strong>clearer thinking</strong>.
              </p>

              <p style={{ marginTop: '30px' }}>
                WealthyAI is not trying to replace human judgment. It exists to support it — quietly, over time.
              </p>
            </div>
          </div>

          {/* Disqus Komment szekció */}
          <div style={{ ...section, background: 'rgba(15, 23, 42, 0.4)', marginTop: '40px', minHeight: '400px' }}>
            <h2 style={sectionTitle}>Discussion</h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '0.9rem' }}>
              Join the conversation. Share your thoughts on how AI should interpret financial states.
            </p>
            
            <div id="disqus_thread"></div>
          </div>

          <p style={footer}>
            WealthyAI supports clarity — not pressure.
          </p>
        </div>
      </div>
    </div>
  );
}

// STÍLUSOK
const page = { position: "relative", minHeight: "100vh", background: "#020617", overflow: "hidden", fontFamily: "Inter, system-ui" };
const content = { position: "relative", zIndex: 10, padding: "80px 24px", display: "flex", justifyContent: "center" };
const container = { width: "100%", maxWidth: 850 };
const bgGrid = { position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "80px 80px", zIndex: 1 };
const bgLines = { position: "fixed", inset: 0, backgroundImage: "linear-gradient(120deg, transparent 40%, rgba(56,189,248,0.08) 50%, transparent 60%)", backgroundSize: "1200px 1200px", zIndex: 2 };
const bgGlow = { position: "fixed", inset: 0, background: "radial-gradient(circle at 30% 20%, rgba(56,189,248,0.12), transparent 40%), radial-gradient(circle at 70% 80%, rgba(167,139,250,0.12), transparent 45%)", zIndex: 3 };
const title = { fontSize: "3rem", marginBottom: 12, color: "#ffffff", fontWeight: "800", letterSpacing: "-1px" };
const intro = { color: "#e5e7eb", maxWidth: 720, marginBottom: 32, fontSize: 16 };
const section = { width: "100%", marginBottom: 28, padding: "40px", borderRadius: "24px", background: "rgba(56,189,248,0.06)", border: "1px solid rgba(125,211,252,0.2)", backdropFilter: "blur(12px)", boxSizing: "border-box", position: "relative", zIndex: 12 };
const sectionTitle = { fontSize: "1.5rem", color: "#f0f9ff", marginBottom: 15 };
const sectionText = { fontSize: "1.1rem", lineHeight: "1.7", color: "#f8fafc" };
const footer = { marginTop: 60, fontSize: 14, color: "#94a3b8", textAlign: "center" };
const back = { marginBottom: 32, padding: "8px 16px", fontSize: 13, borderRadius: 8, background: "rgba(148,163,184,0.18)", border: "1px solid rgba(148,163,184,0.35)", color: "#ffffff", cursor: "pointer", position: "relative", zIndex: 20 };
