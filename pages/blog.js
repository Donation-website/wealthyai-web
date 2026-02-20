import React, { useEffect } from 'react';

export default function Blog() {
  useEffect(() => {
    // 1. Disqus Embed
    const d = document;
    if (!d.getElementById('disqus-embed-script')) {
      const s = d.createElement('script');
      s.id = 'disqus-embed-script';
      s.src = 'https://mywealthyai.disqus.com/embed.js';
      s.setAttribute('data-timestamp', +new Date());
      (d.head || d.body).appendChild(s);
    }

    // 2. Disqus Count
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
                February 20, 2026 • Manifest & Vlog #1
              </span>
            </p>
          </header>

          {/* Manifest Section */}
          <div style={section}>
            <p style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '30px', fontWeight: '300', fontStyle: 'italic', lineHeight: '1.4' }}>
              "We didn’t build WealthyAI to tell people what to do with their money."
            </p>

            <div style={sectionText}>
              <p>
                There are already countless tools that promise clarity or certainty. Most of them collapse under their own promises. 
                <strong> WealthyAI</strong> exists to interpret the hidden structures of your finances.
              </p>
            </div>

            {/* VLOG SECTION - KÉP 1 */}
            <div style={vlogStep}>
              <h3 style={stepTitle}>01. Visualizing Fragility</h3>
              <img src="/wealthyai/icons/blog1.jpg" alt="Financial Structure" style={vlogImage} />
              <p style={caption}>
                Why are we showing you a 43.8% fragility score? Because an account balance doesn't show you how "breakable" your system is. We focus on the structural integrity of your wealth.
              </p>
            </div>

            {/* VLOG SECTION - KÉP 2 */}
            <div style={vlogStep}>
              <h3 style={stepTitle}>02. The AI Interpretation</h3>
              <img src="/wealthyai/icons/blog2.jpg" alt="AI Logic" style={vlogImage} />
              <p style={caption}>
                Instead of rigid advice, our AI interprets recurring rigidities. It builds buffers against market fluctuations by analyzing your unique financial DNA.
              </p>
            </div>

            {/* VLOG SECTION - KÉP 3 */}
            <div style={vlogStep}>
              <h3 style={stepTitle}>03. Strategic Path</h3>
              <img src="/wealthyai/icons/blog3.jpg" alt="90 Day Roadmap" style={vlogImage} />
              <p style={caption}>
                90-day direction: Cash reserve management and energy exposure mitigation. We provide the interpretation, you maintain the control.
              </p>
            </div>

            <div style={ctaBox}>
              <h3 style={{ color: '#fff', marginBottom: '10px' }}>A Different Perspective</h3>
              <p style={sectionText}>
                In 2026, you don't need more data—you need a better lens to see it through. 
                This is why WealthyAI is the choice for those who seek clarity over pressure. 
                <strong> How do you see your financial fragility today?</strong>
              </p>
            </div>
          </div>

          {/* Disqus Section */}
          <div style={{ ...section, background: 'rgba(15, 23, 42, 0.4)', marginTop: '40px', minHeight: '400px' }}>
            <h2 style={sectionTitle}>Discussion</h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '0.9rem' }}>
              Join the conversation. Share your thoughts on how AI should interpret financial states.
            </p>
            <div id="disqus_thread"></div>
          </div>

          <p style={footer}>
            WealthyAI supports clarity — not pressure. © 2026
          </p>
        </div>
      </div>
    </div>
  );
}

// STYLES
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
const vlogStep = { marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px' };
const stepTitle = { color: '#38bdf8', fontSize: '1.1rem', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' };
const vlogImage = { width: '100%', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.3)', marginBottom: '15px' };
const caption = { color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6' };
const ctaBox = { marginTop: '40px', padding: '25px', background: 'rgba(56,189,248,0.1)', borderRadius: '16px', border: '1px solid #38bdf8' };
const footer = { marginTop: 60, fontSize: 14, color: "#94a3b8", textAlign: "center" };
const back = { marginBottom: 32, padding: "8px 16px", fontSize: 13, borderRadius: 8, background: "rgba(148,163,184,0.18)", border: "1px solid rgba(148,163,184,0.35)", color: "#ffffff", cursor: "pointer", position: "relative", zIndex: 20 };
