import { useEffect, useState, useRef } from "react";
import {
  LineChart, Line,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

/* ===== ANIMATION COMPONENT (SpiderNet - HD) ===== */
function SpiderNet({ isMobile, height }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (isMobile || !height || height < 50) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    const particleCount = 180; 
    const connectionDistance = 130;

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
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > rect.width) this.vx *= -1;
        if (this.y < 0 || this.y > rect.height) this.vy *= -1;
      }
      draw() {
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    };

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
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.4 * (1 - dist / connectionDistance)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, height]);

  return <canvas ref={canvasRef} style={{ display: 'block', background: 'transparent' }} />;
}

/* ===== CONSTANTS ===== */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CATEGORIES = ["rent", "food", "transport", "entertainment", "subscriptions", "other"];
const COLORS = {
  rent: "#38bdf8",
  food: "#22d3ee",
  transport: "#34d399",
  entertainment: "#a78bfa",
  subscriptions: "#f472b6",
  other: "#facc15",
};

export default function PremiumWeek() {
  const [isMobile, setIsMobile] = useState(false);
  const [openDays, setOpenDays] = useState({ Mon: true });
  const aiBoxRef = useRef(null);
  const [aiBoxHeight, setAiBoxHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [incomeType, setIncomeType] = useState("monthly");
  const [incomeValue, setIncomeValue] = useState(3000);
  const [country, setCountry] = useState("US");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  const [week, setWeek] = useState(
    DAYS.reduce((acc, d) => {
      acc[d] = CATEGORIES.reduce((o, c) => ({ ...o, [c]: 0 }), {});
      return acc;
    }, {})
  );

  // AI Box magasságának mérése az amőba számára
  useEffect(() => {
    if (aiOpen && aiBoxRef.current) {
      setAiBoxHeight(aiBoxRef.current.offsetHeight);
    }
  }, [aiOpen, aiText, openDays]);

  const update = (day, cat, val) => {
    setWeek({ ...week, [day]: { ...week[day], [cat]: Number(val) } });
  };

  const toggleDay = (day) => {
    setOpenDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const dailyTotals = DAYS.map(d => Object.values(week[d]).reduce((a, b) => a + b, 0));
  const weeklySpend = dailyTotals.reduce((a, b) => a + b, 0);
  const weeklyIncome = incomeType === "daily" ? incomeValue * 7 : incomeType === "weekly" ? incomeValue : incomeValue / 4.333;

  const chartData = DAYS.map((d, i) => ({
    day: d,
    total: dailyTotals[i],
    balance: (weeklyIncome / 7) - dailyTotals[i],
    ...week[d],
  }));

  const pieData = CATEGORIES.map(c => ({
    name: c,
    value: DAYS.reduce((s, d) => s + week[d][c], 0),
    fill: COLORS[c],
  }));

  const scatterData = DAYS.map((d, i) => ({ x: i + 1, y: dailyTotals[i], day: d }));

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

  return (
    <div style={page}>
      <a href="/help" style={helpButton}>Help</a>

      <div style={{...contentWrap, padding: isMobile ? "60px 15px 120px 15px" : "40px"}}>
        <div style={header}>
          <h1 style={{...title, fontSize: isMobile ? "1.6rem" : "2.6rem"}}>WEALTHYAI · WEEKLY INTELLIGENCE</h1>
          <p style={subtitle}>Weekly behavioral analysis with country-aware intelligence.</p>
        </div>

        <div style={{...layout, gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1.3fr", gap: isMobile ? 20 : 40}}>
          {/* BAL OSZLOP */}
          <div style={left}>
            <div style={incomeBox}>
              <div style={{color: "#7dd3fc", fontSize: "0.8rem", marginBottom: 12, fontWeight: "bold", letterSpacing: "1px"}}>WEEKLY INCOME SETUP</div>
              <div style={row}>
                <select value={incomeType} onChange={(e) => setIncomeType(e.target.value)} style={regionSelect}>
                  <option value="daily">Daily Income</option>
                  <option value="weekly">Weekly Income</option>
                  <option value="monthly">Monthly Income</option>
                </select>
                <input type="number" value={incomeValue} onChange={(e) => setIncomeValue(Number(e.target.value))} style={input} />
              </div>
            </div>

            <div style={regionRow}>
              <span style={regionLabel}>Region Settings</span>
              <select value={country} onChange={(e) => setCountry(e.target.value)} style={regionSelect}>
                <option value="US">United States</option>
                <option value="EU">European Union</option>
                <option value="UK">United Kingdom</option>
                <option value="HU">Hungary</option>
              </select>
            </div>

            {DAYS.map((d) => (
              <div key={d} style={dayBox}>
                <div onClick={() => toggleDay(d)} style={dayTitle}>
                  <span>{d.toUpperCase()}</span>
                  <span style={{fontSize: "1.2rem"}}>{openDays[d] ? "−" : "+"}</span>
                </div>
                {openDays[d] && (
                  <div style={{marginTop: 15, borderTop: "1px solid rgba(56,189,248,0.1)", paddingTop: 10}}>
                    {CATEGORIES.map(c => (
                      <div key={c} style={row}>
                        <span style={{fontSize: "0.75rem", color: "#94a3b8"}}>{c.toUpperCase()}</span>
                        <input type="number" value={week[d][c]} onChange={e => update(d, c, e.target.value)} style={input} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* AZ AMŐBA CSAK AI OPEN ESETÉN JELENIK MEG */}
            {!isMobile && aiOpen && (
              <div style={{ marginTop: 20, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(56,189,248,0.1)' }}>
                <SpiderNet isMobile={isMobile} height={aiBoxHeight} />
              </div>
            )}
          </div>

          {/* JOBB OSZLOP */}
          <div style={right}>
            <div style={{display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16}}>
              <Chart title="Daily spending vs Income">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                  <XAxis dataKey="day" fontSize={10} stroke="#64748b" />
                  <YAxis fontSize={10} stroke="#64748b" />
                  <Tooltip contentStyle={tooltipBase} />
                  <Line dataKey="total" name="Spending" stroke="#38bdf8" strokeWidth={3} dot={{r: 4}} />
                  <Line dataKey="balance" name="Net Balance" stroke="#facc15" strokeDasharray="5 5" />
                </LineChart>
              </Chart>

              <Chart title="Category trends">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                  <XAxis dataKey="day" fontSize={10} stroke="#64748b" />
                  <YAxis fontSize={10} stroke="#64748b" />
                  <Tooltip contentStyle={tooltipBase} />
                  <Legend wrapperStyle={{fontSize: 10}} />
                  {CATEGORIES.map(c => (
                    <Line key={c} dataKey={c} stroke={COLORS[c]} dot={false} strokeWidth={2} />
                  ))}
                </LineChart>
              </Chart>

              <Chart title="Weekly distribution">
                <PieChart>
                  <Pie data={pieData} dataKey="value" outerRadius={70} stroke="none">
                    {pieData.map((p, i) => <Cell key={i} fill={p.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipBase} />
                </PieChart>
              </Chart>

              <Chart title="Daily dispersion">
                <ScatterChart>
                  <CartesianGrid stroke="#0f172a" />
                  <XAxis dataKey="x" name="Day" fontSize={10} stroke="#64748b" />
                  <YAxis dataKey="y" name="Spending" fontSize={10} stroke="#64748b" />
                  <Tooltip contentStyle={tooltipBase} />
                  <Scatter data={scatterData} fill="#a78bfa" />
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
              <div ref={aiBoxRef} style={aiBox}>
                <div style={aiHeader}>
                  <strong>Weekly AI Insight</strong>
                  <button onClick={() => setAiOpen(false)} style={closeBtn}>✕</button>
                </div>
                <pre style={aiTextStyle}>{aiText}</pre>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={footerText}>© 2026 WealthyAI — All rights reserved.</div>
      <div style={upsellText}>Monthly plans unlock country-specific tax optimization and advanced stress testing.</div>
    </div>
  );
}

function Chart({ title, children }) {
  return (
    <div style={chartBox}>
      <div style={chartTitle}>{title}</div>
      <ResponsiveContainer width="100%" height={180}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

/* ===== STYLES (ORIGINAL BACKGROUND RESTORED) ===== */
const tooltipBase = { background: "#020617", border: "1px solid #1e293b", borderRadius: 8, fontSize: 11, color: "#f8fafc" };

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
    url("/wealthyai/icons/generated.png")
  `,
  backgroundRepeat: "repeat, repeat, no-repeat, no-repeat, repeat",
  backgroundSize: "auto, auto, 100% 100%, 100% 100%, 280px auto",
  overflowX: "hidden"
};

const contentWrap = { width: "100%", boxSizing: "border-box" };
const header = { textAlign: "center", marginBottom: 30 };
const title = { margin: 0, fontWeight: "bold", letterSpacing: "-1px" };
const subtitle = { color: "#94a3b8", marginTop: 10 };

const helpButton = {
  position: "absolute", top: 24, right: 24, padding: "8px 14px", borderRadius: 10, fontSize: 13,
  color: "#7dd3fc", border: "1px solid #1e293b", background: "rgba(2,6,23,0.6)", backdropFilter: "blur(6px)",
  textDecoration: "none", zIndex: 100
};

const layout = { display: "grid", maxWidth: "1400px", margin: "0 auto" };
const left = { display: "flex", flexDirection: "column" };
const right = { display: "flex", flexDirection: "column", gap: 20 };

const incomeBox = { background: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: 14, padding: 20, marginBottom: 20 };
const dayBox = { background: "rgba(30, 41, 59, 0.2)", border: "1px solid #1e293b", borderRadius: 12, padding: "12px 16px", marginBottom: 10 };
const dayTitle = { display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", color: "#38bdf8", fontWeight: "bold", fontSize: "0.9rem", letterSpacing: "1px" };

const regionRow = { marginBottom: 15, display: "flex", alignItems: "center", gap: 10 };
const regionLabel = { color: "#7dd3fc", fontSize: "0.8rem", fontWeight: "bold" };
const regionSelect = { background: "#0f172a", color: "#f8fafc", border: "1px solid #1e293b", padding: "6px 12px", borderRadius: 8, fontSize: "13px" };

const row = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 };
const input = { background: "transparent", border: "none", borderBottom: "1px solid rgba(56, 189, 248, 0.4)", color: "#38bdf8", width: 75, textAlign: "right", padding: "2px 5px", fontSize: "16px", outline: "none" };

const chartBox = { background: "rgba(15, 23, 42, 0.6)", border: "1px solid #1e293b", borderRadius: 14, padding: 15 };
const chartTitle = { fontSize: 10, color: "#7dd3fc", marginBottom: 15, textTransform: "uppercase", letterSpacing: "1px" };

const summary = { padding: "18px", background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: 12, textAlign: "center", fontSize: "0.95rem" };
const aiButton = { width: "100%", padding: 16, background: "#38bdf8", border: "none", borderRadius: 12, fontWeight: "bold", color: "#020617", cursor: "pointer" };
const aiBox = { background: "rgba(15, 23, 42, 0.9)", border: "1px solid #38bdf8", borderRadius: 14, padding: 20, backdropFilter: "blur(12px)" };
const aiHeader = { display: "flex", justifyContent: "space-between", marginBottom: 15, color: "#38bdf8" };
const aiTextStyle = { whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: "14px", color: "#cbd5e1", fontFamily: "inherit" };
const closeBtn = { background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 20 };

const footerText = { position: "fixed", bottom: 20, left: 40, fontSize: "11px", color: "#64748b" };
const upsellText = { position: "fixed", bottom: 20, right: 40, fontSize: "11px", color: "#64748b", textAlign: "right" };
