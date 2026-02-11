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

/* ===== ANIMATION COMPONENT (SpiderNet - HD & Ultra Dense) ===== */
function SpiderNet({ isMobile, height }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isMobile || !height) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let particles = [];
    const particleCount = 220; 
    const connectionDistance = 140; 
    const mouse = { x: null, y: null, radius: 150 };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${height}px`;
    };

    window.addEventListener("resize", resize);
    resize();

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    class Particle {
      constructor() {
        const rect = canvas.getBoundingClientRect();
        this.x = Math.random() * rect.width;
        this.y = Math.random() * rect.height;
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
        const rect = canvas.getBoundingClientRect();
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > rect.width) this.vx *= -1;
        if (this.y < 0 || this.y > rect.height) this.vy *= -1;

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
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      ctx.clearRect(0, 0, rect.width, rect.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, height]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        display: 'block',
        width: '100%', 
        height: `${height}px`,
        background: 'transparent'
      }} 
    />
  );
}

export default function DayPremium() {
  const [isMobile, setIsMobile] = useState(false);
  const aiBoxRef = useRef(null);
  const [aiBoxHeight, setAiBoxHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [data, setData] = useState({
    income: 5000,
    fixed: 2000,
    variable: 1500,
  });

  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  // Figyeljük a box magasságát
  useEffect(() => {
    if (aiOpen && aiBoxRef.current) {
      setAiBoxHeight(aiBoxRef.current.offsetHeight);
    }
  }, [aiOpen, aiText]);

  /* ===== SUBSCRIPTION CHECK - FIXED FOR VIP ===== */
  useEffect(() => {
    // 1. ELŐSZÖR A VIP TOKENT NÉZZÜK
    const vipToken = localStorage.getItem("wai_vip_token");
    if (vipToken === "MASTER-DOMINANCE-2026") {
      return; // Ha mester kód van, megállunk, beengedve.
    }

    // 2. HA NINCS VIP, AKKOR A STRIPE-OT NÉZZÜK
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      window.location.href = "/start";
      return;
    }

    fetch("/api/verify-active-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(res => res.json())
      .then(d => {
        if (!d.valid) window.location.href = "/start";
      })
      .catch(() => {
        window.location.href = "/start";
      });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("userFinancials");
    if (saved) setData(JSON.parse(saved));
  }, []);

  const surplus = data.income - (data.fixed + data.variable);
  const savingsRate = data.income > 0 ? (surplus / data.income) * 100 : 0;
  const fiveYearProjection = surplus * 60 * 1.45;

  const chartData = [
    { name: "Now", value: surplus },
    { name: "Y1", value: surplus * 12 * 1.08 },
    { name: "Y3", value: surplus * 36 * 1.25 },
    { name: "Y5", value: surplus * 60 * 1.45 },
  ];

  const askAI = async () => {
    setLoading(true);
    setAiOpen(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "day",
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

  /* ===== TICKER COMPONENT ===== */
  const WealthyTicker = () => {
    if (isMobile) return null;

    const tickerText = "WealthyAI interprets your financial state over time — not advice, not prediction, just clarity • Interpretation over advice • Clarity over certainty • Insight unfolds over time • Financial understanding isn’t instant • Context changes • Insight follows time • Clarity over certainty • Built on time, not urgency • ";

    return (
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 0,
          width: "100%",
          height: 18,
          overflow: "hidden",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
            fontSize: 11,
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.75)",
            animation: "waiScroll 45s linear infinite",
          }}
        >
          <span>{tickerText}</span>
          <span>{tickerText}</span>
        </div>
      </div>
    );
  };

  return (
    <div style={page}>
      <WealthyTicker />
      
      <a href="/day/help" style={{
        ...helpButton,
        top: isMobile ? 12 : 24,
        right: isMobile ? 12 : 24
      }}>Help</a>

      <div style={{
        ...contentWrap,
        padding: isMobile ? "60px 15px 120px 15px" : "40px"
      }}>
        <div style={header}>
          <h1 style={{
            ...title,
            fontSize: isMobile ? "1.6rem" : "2.6rem"
          }}>WEALTHYAI · PRO INTELLIGENCE</h1>
          <p style={subtitle}>
            Thank you for choosing the <strong>1-Day Professional Access</strong>.
          </p>
        </div>

        <div style={{
          ...layout,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1.3fr",
          gap: isMobile ? "20px" : "40px",
          alignItems: 'stretch'
        }}>
          {/* BAL OSZLOP */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Metric label="MONTHLY SURPLUS" value={`$${surplus.toLocaleString()}`} isMobile={isMobile} />
            <Metric label="SAVINGS RATE" value={`${savingsRate.toFixed(1)}%`} isMobile={isMobile} />
            <Metric
              label="5Y PROJECTION"
              value={`$${Math.round(fiveYearProjection).toLocaleString()}`}
              isMobile={isMobile}
            />

            <div style={{ flex: 1 }}>
              {aiOpen && (
                <div ref={aiBoxRef} style={aiBox}>
                  <div style={aiHeader}>
                    <strong>AI Insight</strong>
                    <button onClick={() => setAiOpen(false)} style={closeBtn}>✕</button>
                  </div>
                  <pre style={aiTextStyle}>{aiText}</pre>
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
              <button onClick={askAI} style={aiButton}>
                {loading ? "ANALYZING…" : "GENERATE AI STRATEGY"}
              </button>
            </div>
          </div>

          {/* JOBB OSZLOP */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={inputPanel}>
              {["income", "fixed", "variable"].map((k) => (
                <div key={k} style={inputRow}>
                  <span>{k.toUpperCase()}</span>
                  <input
                    type="number"
                    value={data[k]}
                    onChange={(e) =>
                      setData({ ...data, [k]: Number(e.target.value) })
                    }
                    style={input}
                  />
                </div>
              ))}
            </div>

            <div style={{
              ...chartGrid,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr"
            }}>
              <MiniChart title="Cash Flow Projection" data={chartData} />
              <MiniBar title="Expense Distribution" value={data.fixed + data.variable} />
            </div>

            {/* AZ AMŐBA HELYE: Dinamikusan igazítva az AI boxhoz */}
            {!isMobile && aiOpen && (
              <div style={{ flex: 0, marginTop: '20px', width: '100%' }}>
                <SpiderNet isMobile={isMobile} height={aiBoxHeight} />
              </div>
            )}
          </div>
        </div>
      </div>

      {!isMobile && (
        <div style={footerLeft}>
          © 2026 WealthyAI — All rights reserved.
        </div>
      )}

      <div style={{
        ...upsellFixed,
        position: isMobile ? "relative" : "fixed",
        padding: isMobile ? "20px" : "20px 0",
        background: isMobile ? "transparent" : "transparent",
        backdropFilter: isMobile ? "none" : "none",
        fontSize: isMobile ? "12px" : "14px",
        borderTop: isMobile ? "none" : "none", 
      }}>
        Weekly and Monthly plans unlock country-specific tax optimization,
        stress testing and advanced projections.
        {isMobile && <div style={{marginTop: 10, fontSize: 10, opacity: 0.6}}>© 2026 WealthyAI</div>}
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

/* ===== COMPONENTS ===== */

function Metric({ label, value, isMobile }) {
  return (
    <div style={{
      ...metric,
      marginBottom: isMobile ? "15px" : "25px"
    }}>
      <div style={metricLabel}>{label}</div>
      <div style={{
        ...metricValue,
        fontSize: isMobile ? "1.6rem" : "2.2rem"
      }}>{value}</div>
    </div>
  );
}

function MiniChart({ title, data }) {
  return (
    <div style={chartBox}>
      <div style={chartTitle}>{title}</div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <CartesianGrid stroke="#0f172a" strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
          <YAxis stroke="#64748b" fontSize={10} />
          <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
          <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniBar({ title, value }) {
  const data = [{ name: "Total", v: value }];
  return (
    <div style={chartBox}>
      <div style={chartTitle}>{title}</div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
          <YAxis stroke="#64748b" fontSize={10} />
          <Bar dataKey="v" fill="#22d3ee" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ===== STYLES ===== */

const page = {
  minHeight: "100vh",
  position: "relative",
  color: "#e5e7eb",
  fontFamily: "Inter, system-ui, sans-serif",
  backgroundColor: "#020617",
  backgroundAttachment: "fixed",
  backgroundImage: `
    repeating-linear-gradient(-25deg, rgba(56,189,248,0.06) 0px, rgba(56,189,248,0.06) 1px, transparent 1px, transparent 180px),
    repeating-linear-gradient(35deg, rgba(167,139,250,0.05) 0px, rgba(167,139,250,0.05) 1px, transparent 1px, transparent 260px),
    radial-gradient(circle at 20% 30%, rgba(56,189,248,0.18), transparent 45%),
    radial-gradient(circle at 80% 60%, rgba(167,139,250,0.18), transparent 50%),
    radial-gradient(circle at 45% 85%, rgba(34,211,238,0.14), transparent 45%),
    url("/wealthyai/icons/generated.png")
  `,
  backgroundRepeat: "repeat, repeat, no-repeat, no-repeat, no-repeat, repeat",
  backgroundSize: "auto, auto, 100% 100%, 100% 100%, 100% 100%, 280px auto",
  backgroundPosition: "center",
  overflowX: "hidden"
};

const contentWrap = { width: "100%", boxSizing: "border-box" };
const header = { marginBottom: "30px", textAlign: "center" };
const title = { margin: 0, fontWeight: "bold" };
const subtitle = { color: "#f8fafc", marginTop: "10px" };

const helpButton = {
  position: "absolute",
  padding: "8px 14px",
  borderRadius: 10,
  fontSize: 13,
  textDecoration: "none",
  color: "#7dd3fc",
  border: "1px solid #1e293b",
  background: "rgba(2,6,23,0.6)",
  backdropFilter: "blur(6px)",
  zIndex: 10,
};

const layout = { display: "grid", maxWidth: "1200px", margin: "0 auto" };
const metric = { width: "100%" };
const metricLabel = { color: "#7dd3fc", fontSize: "0.8rem", letterSpacing: "1px" };
const metricValue = { fontWeight: "bold" };

const aiBox = {
  marginTop: "20px",
  background: "rgba(2,6,23,0.8)",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "16px",
  backdropFilter: "blur(10px)",
};

const aiHeader = { display: "flex", justifyContent: "space-between", marginBottom: 10 };
const closeBtn = { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "18px" };

const aiButton = {
  width: "100%",
  padding: "14px",
  background: "#38bdf8",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  color: "#020617",
  cursor: "pointer",
};

const aiTextStyle = {
  marginTop: "10px",
  whiteSpace: "pre-wrap",
  color: "#cbd5f5",
  fontSize: "14px",
  lineHeight: "1.5",
  fontFamily: "inherit"
};

const inputPanel = {
  marginBottom: "20px",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "15px",
  background: "rgba(30, 41, 59, 0.2)"
};

const inputRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" };

const input = {
  background: "rgba(56, 189, 248, 0.05)",
  border: "1px solid rgba(56, 189, 248, 0.2)",
  borderRadius: "4px",
  padding: "5px 10px",
  color: "#38bdf8",
  textAlign: "right",
  width: "100px",
  fontSize: "16px"
};

const chartGrid = { display: "grid", gap: "16px" };
const chartBox = { background: "rgba(2, 6, 23, 0.7)", border: "1px solid #1e293b", borderRadius: "12px", padding: "12px" };
const chartTitle = { fontSize: "0.75rem", color: "#7dd3fc", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" };

const upsellFixed = {
  bottom: 0,
  left: 0,
  width: "100%",
  textAlign: "center",
  color: "#f8fafc",
  boxSizing: "border-box",
  zIndex: 5,
};

const footerLeft = { position: "fixed", bottom: 20, left: 20, fontSize: "12px", opacity: 0.6 };
