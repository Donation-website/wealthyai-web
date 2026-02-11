import { useEffect, useState, useRef } from "react";
import {
  LineChart, Line,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

/* ===== HD SPIDERNET COMPONENT WITH ESCAPE LOGIC ===== */
function SpiderNet({ isMobile, height, color = "#38bdf8" }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null });

  useEffect(() => {
    if (isMobile || !height || height < 5) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    const particleCount = 180; 
    const connectionDistance = 110;
    const mouseRadius = 80;

    const resize = () => {
      const dpr = window.devicePixelRatio || 2;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${height}px`;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    resize();

    class Particle {
      constructor() {
        const rect = canvas.getBoundingClientRect();
        this.x = Math.random() * rect.width;
        this.y = Math.random() * rect.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
      }
      update() {
        const rect = canvas.getBoundingClientRect();
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > rect.width) this.vx *= -1;
        if (this.y < 0 || this.y > rect.height) this.vy *= -1;

        if (mouseRef.current.x !== null) {
          let dx = this.x - mouseRef.current.x;
          let dy = this.y - mouseRef.current.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouseRadius) {
            let force = (mouseRadius - distance) / mouseRadius;
            let directionX = dx / distance;
            let directionY = dy / distance;
            this.x += directionX * force * 5;
            this.y += directionY * force * 5;
          }
        }
      }
      draw() {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      ctx.clearRect(0, 0, rect.width, rect.height);
      particles.forEach(p => { p.update(); p.draw(); });
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.3 * (1 - dist / connectionDistance)})`;
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, height, color]);

  return <canvas ref={canvasRef} style={{ display: 'block', background: 'transparent' }} />;
}

/* ===== CONSTANTS ===== */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CATEGORIES = ["rent", "food", "transport", "entertainment", "subscriptions", "other"];
const COLORS = { rent: "#38bdf8", food: "#22d3ee", transport: "#34d399", entertainment: "#a78bfa", subscriptions: "#f472b6", other: "#facc15" };

export default function PremiumWeek() {
  const [isMobile, setIsMobile] = useState(false);
  const [openDays, setOpenDays] = useState({});
  const [aiOpen, setAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [incomeType, setIncomeType] = useState("monthly");
  const [incomeValue, setIncomeValue] = useState(3000);
  const [country, setCountry] = useState("US");

  const leftColRef = useRef(null);
  const rightColRef = useRef(null);
  const [leftNetHeight, setLeftNetHeight] = useState(0);
  const [rightNetHeight, setRightNetHeight] = useState(0);

  /* ================= ACCESS CHECK (MASTER CODE & STRIPE) ================= */
  useEffect(() => {
    const vipToken = localStorage.getItem("wai_vip_token");
    if (vipToken === "MASTER-DOMINANCE-2026") {
      return; 
    }

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
      .then(r => r.json())
      .then(d => {
        if (!d.valid) window.location.href = "/start";
      })
      .catch(() => {
        window.location.href = "/start";
      });
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const lang = navigator.language || "";
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (lang.startsWith("hu") || tz.includes("Budapest")) setCountry("HU");
    else if (lang.startsWith("en-GB")) setCountry("UK");
    else if (lang.startsWith("en")) setCountry("US");
    else setCountry("EU");
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const updateHeights = () => {
      const leftH = leftColRef.current?.offsetHeight || 0;
      const rightH = rightColRef.current?.offsetHeight || 0;
      
      const diffL = rightH - leftH;
      setLeftNetHeight(diffL > 1 ? diffL : 0);

      const diffR = leftH - rightH;
      setRightNetHeight(diffR > 1 ? diffR : 0);
    };
    const timer = setTimeout(updateHeights, 100);
    return () => clearTimeout(timer);
  }, [aiOpen, aiText, openDays, isMobile, incomeType, incomeValue]);

  const [week, setWeek] = useState(DAYS.reduce((acc, d) => {
    acc[d] = CATEGORIES.reduce((o, c) => ({ ...o, [c]: 0 }), {});
    return acc;
  }, {}));

  const update = (day, cat, val) => setWeek({ ...week, [day]: { ...week[day], [cat]: Number(val) } });
  const toggleDay = (day) => setOpenDays(prev => ({ ...prev, [day]: !prev[day] }));

  const dailyTotals = DAYS.map(d => Object.values(week[d]).reduce((a, b) => a + b, 0));
  const weeklySpend = dailyTotals.reduce((a, b) => a + b, 0);
  const weeklyIncome = incomeType === "daily" ? incomeValue * 7 : incomeType === "weekly" ? incomeValue : incomeValue / 4.333;

  const chartData = DAYS.map((d, i) => ({ 
    day: d, 
    total: dailyTotals[i], 
    balance: (weeklyIncome / 7) - dailyTotals[i], 
    x: i + 1, 
    ...week[d] 
  }));

  const pieData = CATEGORIES.map(c => ({ name: c, value: DAYS.reduce((s, d) => s + week[d][c], 0), fill: COLORS[c] }));

  const runAI = async () => {
    setLoading(true);
    setAiOpen(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "week", country, weeklyIncome, weeklySpend, dailyTotals, breakdown: week }),
      });
      const data = await res.json();
      setAiText(data.insight || "AI analysis unavailable.");
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
      <div style={{ position: "absolute", top: 10, left: 0, width: "100%", height: 18, overflow: "hidden", zIndex: 20, pointerEvents: "none" }}>
        <div style={{ display: "inline-block", whiteSpace: "nowrap", fontSize: 11, letterSpacing: "0.08em", color: "rgba(255,255,255,0.75)", animation: "waiScroll 45s linear infinite" }}>
          <span>{tickerText}</span><span>{tickerText}</span>
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={tooltipContainer}>
          <p style={{ margin: "0 0 5px 0", fontWeight: "bold", color: "#7dd3fc" }}>{label}</p>
          {payload.map((entry, index) => (
            <div key={index} style={{ color: entry.color || entry.payload.fill, fontSize: "12px", padding: "2px 0" }}>
              {entry.name.toUpperCase()}: <span style={{ color: "#fff" }}>${entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={page}>
      <WealthyTicker />
      <a href="/help" style={helpButton}>Help</a>

      <div style={{...contentWrap, padding: isMobile ? "60px 15px 120px 15px" : "40px"}}>
        <div style={header}>
          <h1 style={{...title, fontSize: isMobile ? "1.6rem" : "2.6rem"}}>WEALTHYAI · WEEKLY INTELLIGENCE</h1>
          <p style={subtitle}>Precise behavioral mapping and country-aware AI insights.</p>
        </div>

        <div style={{...layout, gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1.3fr", gap: 40, alignItems: 'start'}}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div ref={leftColRef}>
              <div style={incomeBox}>
                <div style={sectionLabel}>INCOME SETUP</div>
                <div style={row}>
                  <select value={incomeType} onChange={(e) => setIncomeType(e.target.value)} style={regionSelect}>
                    <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                  </select>
                  <input type="number" value={incomeValue} onChange={(e) => setIncomeValue(Number(e.target.value))} style={input} />
                </div>
              </div>

              <div style={regionRow}>
                <span style={regionLabel}>Region Setting</span>
                <select value={country} onChange={(e) => setCountry(e.target.value)} style={regionSelect}>
                  <option value="US">US</option><option value="EU">EU</option><option value="UK">UK</option><option value="HU">HU</option>
                </select>
              </div>

              {DAYS.map((d) => (
                <div key={d} style={dayBox}>
                  <div onClick={() => toggleDay(d)} style={dayTitle}>
                    <span>{d.toUpperCase()}</span>
                    <span>{openDays[d] ? "−" : "+"}</span>
                  </div>
                  {openDays[d] && (
                    <div style={inputList}>
                      {CATEGORIES.map(c => (
                        <div key={c} style={row}>
                          <span style={catLabel}>{c.toUpperCase()}</span>
                          <input type="number" value={week[d][c]} onChange={e => update(d, c, e.target.value)} style={input} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {!isMobile && leftNetHeight > 0 && (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <SpiderNet isMobile={isMobile} height={leftNetHeight} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div ref={rightColRef} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                <Chart title="Daily spending vs Income">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                    <XAxis dataKey="day" fontSize={10} stroke="#64748b" />
                    <YAxis fontSize={10} stroke="#64748b" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line dataKey="total" name="Spending" stroke="#38bdf8" strokeWidth={3} dot={{r: 4}} />
                    <Line dataKey="balance" name="Net Balance" stroke="#facc15" strokeDasharray="5 5" />
                  </LineChart>
                </Chart>

                <Chart title="Category trends">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                    <XAxis dataKey="day" fontSize={10} stroke="#64748b" />
                    <YAxis fontSize={10} stroke="#64748b" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{fontSize: 10}} />
                    {CATEGORIES.map(c => <Line key={c} dataKey={c} name={c} stroke={COLORS[c]} dot={false} strokeWidth={2} />)}
                  </LineChart>
                </Chart>

                <Chart title="Weekly distribution">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" outerRadius={70} stroke="none">
                      {pieData.map((p, i) => <Cell key={i} fill={p.fill} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </Chart>

                <Chart title="Daily dispersion">
                  <ScatterChart>
                    <CartesianGrid stroke="#0f172a" strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="x" name="Day Index" hide />
                    <XAxis type="category" dataKey="day" name="Day" fontSize={10} stroke="#64748b" />
                    <YAxis type="number" dataKey="total" name="Spending" fontSize={10} stroke="#64748b" />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Spending" data={chartData} fill="#a78bfa" />
                  </ScatterChart>
                </Chart>
              </div>

              <div style={summary}>
                WEEKLY SPEND: <strong style={{color: "#fb7185"}}>${Math.round(weeklySpend).toLocaleString()}</strong> · 
                SURPLUS: <strong style={{color: "#34d399"}}>${Math.round(weeklyIncome - weeklySpend).toLocaleString()}</strong>
              </div>

              <button onClick={runAI} style={aiButton}>
                {loading ? "ANALYZING BEHAVIOR…" : "RUN WEEKLY AI ANALYSIS"}
              </button>

              {aiOpen && (
                <div style={aiBox}>
                  <div style={aiHeader}>
                    <strong>Weekly AI Insight</strong>
                    <button onClick={() => setAiOpen(false)} style={closeBtn}>✕</button>
                  </div>
                  <pre style={aiTextStyle}>{aiText}</pre>
                </div>
              )}
            </div>

            {!isMobile && !aiOpen && rightNetHeight > 0 && (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <SpiderNet isMobile={isMobile} height={rightNetHeight} color="#a78bfa" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={footerText}>© 2026 WealthyAI — All rights reserved.</div>
      <div style={upsellText}>Active Intelligence: {country} Database</div>

      <style>{`
        @keyframes waiScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function Chart({ title, children }) {
  return (
    <div style={chartBox}>
      <div style={chartTitle}>{title}</div>
      <ResponsiveContainer width="100%" height={180}>{children}</ResponsiveContainer>
    </div>
  );
}

/* ===== STYLES ===== */
const tooltipContainer = { background: "rgba(2, 6, 23, 0.95)", border: "1px solid #1e293b", padding: "12px", borderRadius: "10px", backdropFilter: "blur(12px)" };
const page = { 
  minHeight: "100vh", position: "relative", color: "#e5e7eb", fontFamily: "Inter, sans-serif", backgroundColor: "#020617",
  backgroundImage: `
    repeating-linear-gradient(-25deg, rgba(56,189,248,0.06) 0px, rgba(56,189,248,0.06) 1px, transparent 1px, transparent 180px), 
    repeating-linear-gradient(35deg, rgba(167,139,250,0.05) 0px, rgba(167,139,250,0.05) 1px, transparent 1px, transparent 260px), 
    radial-gradient(circle at 20% 30%, rgba(56,189,248,0.18), transparent 45%), 
    radial-gradient(circle at 80% 60%, rgba(167,139,250,0.18), transparent 50%), 
    url("/wealthyai/icons/generated.png")`,
  backgroundAttachment: "fixed", backgroundSize: "auto, auto, 100% 100%, 100% 100%, 280px auto", overflowX: "hidden" 
};
const contentWrap = { width: "100%", boxSizing: "border-box" };
const header = { textAlign: "center", marginBottom: 30 };
const title = { margin: 0, fontWeight: "bold", letterSpacing: "-1px" };
const subtitle = { color: "#94a3b8", marginTop: 10 };
const helpButton = { position: "absolute", top: 24, right: 24, padding: "8px 14px", borderRadius: 10, fontSize: 13, color: "#7dd3fc", border: "1px solid #1e293b", background: "rgba(2,6,23,0.6)", textDecoration: "none", zIndex: 100 };
const layout = { display: "grid", maxWidth: "1450px", margin: "0 auto" };
const sectionLabel = { color: "#7dd3fc", fontSize: "0.8rem", marginBottom: 12, fontWeight: "bold" };
const incomeBox = { background: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: 14, padding: "20px", marginBottom: "22px" };
const regionRow = { marginBottom: "22px", display: "flex", alignItems: "center", gap: 10 };
const regionLabel = { color: "#7dd3fc", fontSize: "0.8rem", fontWeight: "bold" };
const regionSelect = { background: "#0f172a", color: "#f8fafc", border: "1px solid #1e293b", padding: "6px 12px", borderRadius: 8 };
const dayBox = { background: "rgba(30, 41, 59, 0.2)", border: "1px solid #1e293b", borderRadius: 12, padding: "10px 16px", marginBottom: "8px" };
const dayTitle = { display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", color: "#38bdf8", fontWeight: "bold" };
const inputList = { marginTop: 15, borderTop: "1px solid rgba(56,189,248,0.1)", paddingTop: 10 };
const catLabel = { fontSize: "0.75rem", color: "#94a3b8" };
const row = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 };
const input = { background: "transparent", border: "none", borderBottom: "1px solid rgba(56, 189, 248, 0.4)", color: "#38bdf8", width: 75, textAlign: "right", outline: "none" };
const chartBox = { background: "rgba(15, 23, 42, 0.6)", border: "1px solid #1e293b", borderRadius: 14, padding: 15 };
const chartTitle = { fontSize: 10, color: "#7dd3fc", marginBottom: 15, textTransform: "uppercase" };
const summary = { padding: "18px", background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: 12, textAlign: "center", marginBottom: 16 };
const aiButton = { width: "100%", padding: 16, background: "#38bdf8", border: "none", borderRadius: 12, fontWeight: "bold", cursor: "pointer" };
const aiBox = { background: "rgba(15, 23, 42, 0.9)", border: "1px solid #38bdf8", borderRadius: 14, padding: 20, marginTop: 16 };
const aiHeader = { display: "flex", justifyContent: "space-between", marginBottom: 15, color: "#38bdf8" };
const aiTextStyle = { whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: "14px", color: "#cbd5e1", fontFamily: "inherit" };
const closeBtn = { background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 20 };
const footerText = { position: "fixed", bottom: 20, left: 40, fontSize: "11px", color: "#64748b" };
const upsellText = { position: "fixed", bottom: 20, right: 40, fontSize: "11px", color: "#64748b" };
