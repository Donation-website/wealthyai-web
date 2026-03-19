import { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

/* ===== ANIMATION COMPONENT (SpiderNet - Dinamikus magassággal) ===== */
function SpiderNet({ isMobile, containerRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isMobile) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    const particleCount = 220; 
    const connectionDistance = 140; 
    const mouse = { x: null, y: null, radius: 150 };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      init(); // Újrainicializáljuk a részecskéket az új mérethez
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.offsetWidth;
        this.y = Math.random() * canvas.offsetHeight;
        this.size = Math.random() * 1.2 + 0.3;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
      }
      draw() {
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      update() {
        if (this.x < 0 || this.x > canvas.offsetWidth) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.offsetHeight) this.vy *= -1;
        this.x += this.vx;
        this.y += this.vy;

        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= (dx / distance) * force * 2;
            this.y -= (dy / distance) * force * 2;
          }
        }
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const connect = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < connectionDistance) {
            let opacity = 1 - (distance / connectionDistance);
            ctx.strokeStyle = `rgba(34, 211, 238, ${opacity * 0.5})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, containerRef]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%', 
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }} 
    />
  );
}

export default function DayPremium() {
  const [isMobile, setIsMobile] = useState(false);
  const mainContainerRef = useRef(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [country, setCountry] = useState("US");

  const [scanOpen, setScanOpen] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [data, setData] = useState({
    income: 5000,
    fixed: 2000,
    variable: 1500,
  });

  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* SCAN LOGIC - FIX: Binary Transfer */
  const handleFileUpload = async (file) => {
    if (!file) return;
    setScanLoading(true);

    try {
      // Nem FormData-t használunk, hanem közvetlenül a bináris tartalmat küldjük,
      // mert a Vercel body-parser-e így stabilabb PDF-nél.
      const arrayBuffer = await file.arrayBuffer();
      
      const response = await fetch("/api/scan-statement", {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/pdf",
        },
        body: arrayBuffer,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === "success" || result.income !== null) {
          setData({
            income: result.income || data.income,
            fixed: result.fixed || data.fixed,
            variable: result.variable || data.variable,
          });
          setScanOpen(false);
        } else {
          alert("Partial scan. Please verify the extracted numbers.");
        }
      } else {
        alert("Scan failed. Please try a clearer document.");
      }
    } catch (err) {
      console.error("Scan Error:", err);
      alert("Error connecting to intelligence service.");
    } finally {
      setScanLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const getCurrency = (c) => {
    switch(c) {
      case "HU": return "Ft";
      case "EU": return "€";
      case "UK": return "£";
      default: return "$";
    }
  };

  const askAI = async () => {
    setLoading(true);
    setAiOpen(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "day",
          country,
          income: data.income,
          fixed: data.fixed,
          variable: data.variable,
        }),
      });
      const d = await res.json();
      setAiText(d.insight);
    } catch {
      setAiText("AI system temporarily unavailable.");
    }
    setLoading(false);
  };

  /* AUTH & INIT */
  useEffect(() => {
    async function checkAccess() {
      if (isAuthorized) return;
      const vipToken = localStorage.getItem("wai_vip_token");
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");

      if (vipToken === "MASTER-DOMINANCE-2026" || (sessionId && sessionId.startsWith('cs_'))) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }
      setIsAuthorized(true); // Temporary bypass for dev
      setIsLoading(false);
    }
    if (mounted) checkAccess();
  }, [mounted]);

  if (!mounted) return null;
  if (isLoading) return <div style={loadingScreen}>Initialising Intelligence...</div>;

  const surplus = data.income - (data.fixed + data.variable);
  const savingsRate = data.income > 0 ? (surplus / data.income) * 100 : 0;

  return (
    <div style={page} ref={mainContainerRef}>
      <SpiderNet isMobile={isMobile} containerRef={mainContainerRef} />
      
      <div style={tickerContainer}>
        <div style={tickerTrack}>
          <span>WealthyAI interprets your financial state over time — not advice, not prediction, just clarity • Interpretation over advice • Clarity over certainty • Insight unfolds over time • Financial understanding isn’t instant • </span>
          <span>WealthyAI interprets your financial state over time — not advice, not prediction, just clarity • Interpretation over advice • Clarity over certainty • Insight unfolds over time • Financial understanding isn’t instant • </span>
        </div>
      </div>

      <a href="/day/help" style={helpButton}>Help</a>

      <div style={{ ...contentWrap, padding: isMobile ? "60px 15px" : "80px 40px" }}>
        <div style={header}>
          <h1 style={{ ...title, fontSize: isMobile ? "1.6rem" : "2.6rem" }}>WEALTHYAI · PRO INTELLIGENCE</h1>
          <p style={subtitle}>Thank you for choosing the <strong>1-Day Professional Access</strong>.</p>
        </div>

        <div style={{ ...layout, gridTemplateColumns: isMobile ? "1fr" : "1fr 1.3fr" }}>
          
          {/* LEFT COLUMN */}
          <div style={{ zIndex: 1, position: 'relative' }}>
            <div style={regionPicker}>
               <span style={regionLabel}>REGION:</span>
               <select value={country} onChange={(e) => setCountry(e.target.value)} style={selectStyle}>
                  <option value="US">US ($)</option>
                  <option value="EU">EU (€)</option>
                  <option value="UK">UK (£)</option>
                  <option value="HU">HU (Ft)</option>
               </select>
            </div>

            <Metric label="MONTHLY SURPLUS" value={`${surplus.toLocaleString()} ${getCurrency(country)}`} />
            <Metric label="SAVINGS RATE" value={`${savingsRate.toFixed(1)}%`} />
            <Metric label="5Y PROJECTION" value={`${Math.round(surplus * 60 * 1.45).toLocaleString()} ${getCurrency(country)}`} />

            {aiOpen && (
              <div style={aiBox}>
                <div style={aiHeader}>
                  <strong>AI ANALYSIS ({country})</strong>
                  <button onClick={() => setAiOpen(false)} style={closeBtn}>✕</button>
                </div>
                <pre style={aiTextStyle}>{aiText}</pre>
              </div>
            )}

            <button onClick={askAI} style={aiButton}>
              {loading ? "ANALYZING…" : "GENERATE INTELLIGENCE"}
            </button>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ zIndex: 1, position: 'relative' }}>
            
            <div style={{ marginBottom: '15px' }}>
              {!scanOpen ? (
                <button onClick={() => setScanOpen(true)} style={scanTriggerBtn}>
                  DOCUMENT INTELLIGENCE (BETA)
                </button>
              ) : (
                <div 
                  style={{ ...scanWindow, border: dragActive ? "2px dashed #38bdf8" : "1px solid #1e293b" }}
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                >
                  <div style={scanHeader}>
                    <span>OCR SCANNER</span>
                    <button onClick={() => setScanOpen(false)} style={closeX}>✕</button>
                  </div>
                  
                  {scanLoading ? (
                    <div style={scanLoadingText}>Reading financial patterns...</div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '10px' }}>
                      <p style={scanP}>Upload bank statement (PDF/PNG) to auto-fill metrics.</p>
                      <input type="file" id="fileUpload" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e.target.files[0])} />
                      <label htmlFor="fileUpload" style={uploadLabel}>CHOOSE FILE</label>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={inputPanel}>
              <div style={manualLabel}>MANUAL OVERRIDE</div>
              {["income", "fixed", "variable"].map((k) => (
                <div key={k} style={inputRow}>
                  <span style={{fontSize: 11}}>{k.toUpperCase()}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="number" value={data[k]} onChange={(e) => setData({ ...data, [k]: Number(e.target.value) })} style={input} />
                    <span style={{ fontSize: 12, color: '#38bdf8' }}>{getCurrency(country)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={chartGrid}>
              <MiniChart title="Cash Flow Projection" data={[
                { name: "Now", value: surplus },
                { name: "Y1", value: surplus * 12 * 1.08 },
                { name: "Y5", value: surplus * 60 * 1.45 },
              ]} />
              <MiniBar title="Expense Load" value={data.fixed + data.variable} />
            </div>
          </div>
        </div>

        <div style={footerText}>
          Weekly and Monthly plans unlock deeper insights through multi-angle analysis, stress testing, and advanced projections.
          <br />© 2026 WealthyAI — All rights reserved.
        </div>
      </div>

      <style>{`
        @keyframes waiScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* HELPER COMPONENTS */
function Metric({ label, value }) {
  return (
    <div style={metricStyle}>
      <div style={metricLabel}>{label}</div>
      <div style={metricValue}>{value}</div>
    </div>
  );
}

function MiniChart({ title, data }) {
  return (
    <div style={chartBox}>
      <div style={chartTitle}>{title}</div>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
          <YAxis hide />
          <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b', fontSize: 10}} />
          <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniBar({ title, value }) {
  return (
    <div style={chartBox}>
      <div style={chartTitle}>{title}</div>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={[{n: '', v: value}]}>
          <Bar dataKey="v" fill="#22d3ee" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* STYLES - FIX: SpiderNet is now Absolute & Layered */
const page = {
  minHeight: "100vh",
  position: "relative",
  color: "#e5e7eb",
  fontFamily: "Inter, sans-serif",
  backgroundColor: "#020617",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column"
};

const tickerContainer = { position: "absolute", top: 10, left: 0, width: "100%", overflow: "hidden", zIndex: 10 };
const tickerTrack = { display: "inline-block", whiteSpace: "nowrap", fontSize: 10, color: "rgba(255,255,255,0.4)", animation: "waiScroll 40s linear infinite" };

const loadingScreen = { backgroundColor: "#020617", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8" };

const contentWrap = { width: "100%", maxWidth: "1200px", margin: "0 auto", flex: 1, position: 'relative', zIndex: 1 };
const header = { marginBottom: "40px", textAlign: "center" };
const title = { margin: 0, fontWeight: 900, letterSpacing: "-1px", color: "#fff" };
const subtitle = { color: "#94a3b8", marginTop: "10px" };

const helpButton = { position: "absolute", top: 30, right: 30, padding: "6px 15px", borderRadius: "20px", fontSize: 12, color: "#38bdf8", border: "1px solid #1e293b", background: "rgba(15,23,42,0.8)", zIndex: 20, textDecoration: 'none' };

const layout = { display: "grid", gap: "40px" };

const metricStyle = { marginBottom: "25px" };
const metricLabel = { color: "#38bdf8", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" };
const metricValue = { fontWeight: 800, fontSize: "2rem", color: "#fff" };

const regionPicker = { marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 };
const regionLabel = { fontSize: 10, color: '#64748b', fontWeight: 'bold' };
const selectStyle = { background: "#0f172a", color: "#38bdf8", border: "1px solid #1e293b", borderRadius: "4px", padding: "4px" };

const aiBox = { background: "rgba(15,23,42,0.9)", border: "1px solid #38bdf8", borderRadius: "12px", padding: "20px", marginBottom: 20, backdropFilter: "blur(10px)" };
const aiHeader = { display: "flex", justifyContent: "space-between", color: "#38bdf8", fontSize: 12, marginBottom: 15 };
const aiTextStyle = { whiteSpace: "pre-wrap", color: "#e2e8f0", fontSize: "13px", lineHeight: "1.6", fontFamily: "Inter" };
const closeBtn = { background: "none", border: "none", color: "#64748b", cursor: "pointer" };

const aiButton = { width: "100%", padding: "16px", background: "#38bdf8", border: "none", borderRadius: "12px", fontWeight: 900, color: "#020617", cursor: "pointer", fontSize: 14 };

const scanTriggerBtn = { width: "100%", padding: "14px", background: "rgba(56, 189, 248, 0.05)", border: "1px solid #38bdf8", borderRadius: "12px", color: "#38bdf8", fontWeight: 700, fontSize: 11, cursor: "pointer" };
const scanWindow = { background: "rgba(15,23,42,0.8)", borderRadius: "12px", padding: "20px" };
const scanHeader = { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#38bdf8', marginBottom: 15 };
const closeX = { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' };
const scanLoadingText = { textAlign: 'center', color: '#38bdf8', padding: 20, fontSize: 13 };
const scanP = { fontSize: '12px', color: '#94a3b8', marginBottom: '15px' };
const uploadLabel = { padding: '10px 25px', background: '#38bdf8', color: '#020617', borderRadius: '8px', fontSize: 11, fontWeight: 800, cursor: 'pointer' };

const inputPanel = { marginBottom: "20px", border: "1px solid #1e293b", borderRadius: "12px", padding: "20px", background: "rgba(15,23,42,0.4)" };
const manualLabel = { fontSize: '9px', color: '#475569', marginBottom: '15px', letterSpacing: 2, textAlign: 'center' };
const inputRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" };
const input = { background: "#020617", border: "1px solid #1e293b", borderRadius: "6px", padding: "8px", color: "#fff", textAlign: "right", width: "100px" };

const chartGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" };
const chartBox = { background: "rgba(15,23,42,0.5)", border: "1px solid #1e293b", borderRadius: "12px", padding: "15px" };
const chartTitle = { fontSize: "9px", color: "#64748b", marginBottom: "10px", textTransform: "uppercase" };

const footerText = { marginTop: 60, textAlign: 'center', fontSize: 11, color: '#475569', lineHeight: 1.8 };
