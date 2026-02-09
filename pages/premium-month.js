import { useState, useEffect, useRef } from "react";
import {
  saveMonthlySnapshot,
  getMonthlySnapshots,
  getSnapshotByDay,
} from "../lib/monthlyArchive";

/* ================= SPIDERNET COMPONENT (HD & ULTRA DENSE) ================= */
/* Dinamikusan követi a szomszédos AI ablak alját, keret nélkül */
function SpiderNet({ isMobile, height }) {
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isMobile || !height || height < 10) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let particles = [];
    const particleCount = 250; 
    const connectionDistance = 150; 
    const mouse = { x: null, y: null, radius: 160 };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      if (!rect.width) return;
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
      setIsHovered(false);
    };

    const handleMouseEnter = () => setIsHovered(true);

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("mouseenter", handleMouseEnter);

    class Particle {
      constructor() {
        const rect = canvas.parentElement.getBoundingClientRect();
        this.x = Math.random() * (rect.width || 500);
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
      }
      draw() {
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      update() {
        const currentSpeed = isHovered ? 2.2 : 1;
        this.x += this.vx * currentSpeed;
        this.y += this.vy * currentSpeed;

        const rect = canvas.parentElement.getBoundingClientRect();
        const w = rect.width || 500;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
        
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= (dx / distance) * force * 2.5;
            this.y -= (dy / distance) * force * 2.5;
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
            ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.6})`;
            ctx.lineWidth = 0.8;
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

    init();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, height, isHovered]);

  if (isMobile) return null;

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        display: 'block',
        width: '100%', 
        height: '100%',
        background: 'transparent',
        pointerEvents: 'auto',
        border: 'none',
        outline: 'none'
      }} 
    />
  );
}

/* ================= DAILY SIGNAL UNLOCK LOGIC ================= */
const DAILY_SIGNAL_KEY = "dailySignalUnlock";
function getTodayKey() { return new Date().toISOString().slice(0, 10); }

function getDailyUnlockTime() {
  const stored = JSON.parse(localStorage.getItem(DAILY_SIGNAL_KEY) || "{}");
  const today = getTodayKey();
  if (stored.date === today) return stored.unlockAt;
  const hour = Math.floor(Math.random() * 10) + 7; 
  const minute = Math.floor(Math.random() * 60);
  const unlockAt = new Date();
  unlockAt.setHours(hour, minute, 0, 0);
  localStorage.setItem(DAILY_SIGNAL_KEY, JSON.stringify({ date: today, unlockAt: unlockAt.getTime() }));
  return unlockAt.getTime();
}

/* ================= REGIONS CONSTANT ================= */
const REGIONS = [
  { code: "US", label: "United States" },
  { code: "EU", label: "European Union" },
  { code: "UK", label: "United Kingdom" },
  { code: "HU", label: "Hungary" },
  { code: "OTHER", label: "Other regions" },
];

export default function PremiumMonth() {
  const [isMobile, setIsMobile] = useState(false);
  const aiBoxRef = useRef(null);
  const leftCardRef = useRef(null); 
  const [spiderHeight, setSpiderHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [simulationActive, setSimulationActive] = useState(false);
  const [stressFactor, setStressFactor] = useState(0); 

  const [inputs, setInputs] = useState({
    income: 4000, housing: 1200, electricity: 120, gas: 90,
    water: 40, internet: 60, mobile: 40, tv: 30,
    insurance: 150, banking: 20, unexpected: 200, other: 300,
  });

  const calculateFragility = () => {
    const energy = (inputs.electricity + inputs.gas) * (1 + stressFactor);
    const fixed = inputs.housing + inputs.insurance + inputs.banking + energy;
    const ratio = (fixed / inputs.income) * 100;
    return Math.min(Math.max(ratio, 0), 100).toFixed(1);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) { window.location.href = "/start"; return; }
    fetch("/api/verify-active-subscription", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).then(r => r.json()).then(d => { if (!d.valid) window.location.href = "/start"; })
    .catch(() => { window.location.href = "/start"; });
  }, []);

  const [region, setRegion] = useState("EU");
  const [country, setCountry] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const detect = async () => {
      try {
        const r = await fetch("/api/detect-region");
        if (!r.ok) return;
        const j = await r.json();
        if (cancelled) return;
        if (j?.region) setRegion(j.region);
        if (j?.country) setCountry(j.country);
      } catch {}
    };
    detect();
    return () => { cancelled = true; };
  }, []);

  const [viewMode, setViewMode] = useState("executive");
  const [cycleDay, setCycleDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [aiVisible, setAiVisible] = useState(false);
  const [aiCollapsed, setAiCollapsed] = useState(true);
  const [dailySignal, setDailySignal] = useState(null);
  const [dailyPending, setDailyPending] = useState(true);
  const [dailyDual, setDailyDual] = useState(null);
  const [dailySnapshot, setDailySnapshot] = useState(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [exportRange, setExportRange] = useState("day");
  const [isTodayAvailable, setIsTodayAvailable] = useState(false);

  const [weeklyFocus, setWeeklyFocus] = useState(() => {
    try { return JSON.parse(localStorage.getItem("weeklyFocus")); } catch { return null; }
  });
  const [focusOpen, setFocusOpen] = useState(false);
  const [focusPreview, setFocusPreview] = useState(null);
  const getCurrentWeekIndex = () => Math.floor((cycleDay - 1) / 7);
  const FOCUS_OPTIONS = [
    { key: "stability", label: "Stability" },
    { key: "spending", label: "Spending behavior" },
    { key: "resilience", label: "Resilience" },
    { key: "direction", label: "Direction" },
  ];

  const confirmWeeklyFocus = () => {
    if (!focusPreview) return;
    const focus = { key: focusPreview, weekIndex: getCurrentWeekIndex(), setAt: Date.now() };
    setWeeklyFocus(focus);
    localStorage.setItem("weeklyFocus", JSON.stringify(focus));
    setFocusPreview(null);
  };

  const update = (key, value) => {
    setInputs({ ...inputs, [key]: Number(value) });
    setAiVisible(false);
    setAiCollapsed(true);
    setDailyDual(null);
    setDailySnapshot(null);
    setSelectedDay(null);
  };

  useEffect(() => {
    const start = localStorage.getItem("subscriptionPeriodStart") || localStorage.getItem("monthCycleStart");
    if (!start) {
      localStorage.setItem("monthCycleStart", Date.now().toString());
      setCycleDay(1);
    } else {
      const diff = Math.floor((Date.now() - Number(start)) / 86400000);
      setCycleDay(Math.min(diff + 1, 30));
    }
  }, []);

  useEffect(() => {
    const today = getTodayKey();
    const key = `dailyAvailableAt_${today}`;
    let availableAt = localStorage.getItem(key);
    if (!availableAt) {
      const offset = Math.floor(Math.random() * 6 * 60 * 60 * 1000);
      const base = new Date(); base.setHours(7, 0, 0, 0);
      availableAt = (base.getTime() + offset).toString();
      localStorage.setItem(key, availableAt);
    }
    const check = () => { if (Date.now() >= Number(availableAt)) setIsTodayAvailable(true); };
    check();
    const i = setInterval(check, 60000);
    return () => clearInterval(i);
  }, [cycleDay]);

  useEffect(() => {
    const unlockAt = getDailyUnlockTime();
    const check = async () => {
      if (Date.now() < unlockAt) return;
      const seenKey = "dailySignalSeen_" + getTodayKey();
      const cached = localStorage.getItem(seenKey);
      if (cached) { setDailySignal(cached); setDailyPending(false); return; }
      const r = await fetch("/api/get-daily-signal", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, country, cycleDay }),
      });
      const j = await r.json();
      if (j?.signal) { localStorage.setItem(seenKey, j.signal); setDailySignal(j.signal); }
      setDailyPending(false);
    };
    const t = setInterval(check, 30000); check();
    return () => clearInterval(t);
  }, [region, country, cycleDay]);

  const saveBriefing = dual => {
    const today = getTodayKey();
    const stored = JSON.parse(localStorage.getItem("monthlyBriefings")) || [];
    if (!stored.find(b => b.date === today)) {
      stored.push({ id: Date.now(), date: today, cycleDay, executive: dual.executive, directive: dual.directive });
      localStorage.setItem("monthlyBriefings", JSON.stringify(stored.slice(-30)));
    }
  };

  const runAI = async () => {
    setLoading(true); setSelectedDay(null); setSimulationActive(false);
    try {
      const res = await fetch("/api/get-ai-briefing", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, country, cycleDay, weeklyFocus: weeklyFocus?.key, ...inputs }),
      });
      const json = await res.json();
      if (json?.snapshot) {
        setDailyDual(json.snapshot); setViewMode("executive"); setAiVisible(true); setAiCollapsed(false);
        saveBriefing(json.snapshot);
      }
    } catch {}
    setLoading(false);
  };

  const runAIDual = async () => {
    if (!isTodayAvailable) { alert("Today's snapshot is not available yet."); return; }
    setLoading(true); setSelectedDay(null); setSimulationActive(false);
    try {
      const res = await fetch("/api/get-ai-briefing", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, country, cycleDay, weeklyFocus: weeklyFocus?.key, ...inputs }),
      });
      const data = await res.json();
      if (data?.snapshot) {
        saveMonthlySnapshot(data.snapshot); setDailySnapshot(data.snapshot);
        setViewMode("executive"); setAiVisible(true); setAiCollapsed(false);
      }
    } catch {}
    setLoading(false);
  };

  const activeSnapshot = selectedDay ? getSnapshotByDay(selectedDay) : dailySnapshot;
  const activeDual = activeSnapshot || dailyDual;
  const activeText = activeDual && (viewMode === "executive" ? activeDual.executive : activeDual.directive);

  /* PÓKHÁLÓ SZINKRONIZÁCIÓS LOGIKA */
  useEffect(() => {
    if (isMobile) return;
    const syncHeights = () => {
      if (aiBoxRef.current && leftCardRef.current) {
        const rightHeight = aiBoxRef.current.offsetHeight;
        const leftUpperHeight = leftCardRef.current.offsetHeight;
        const calculated = rightHeight - leftUpperHeight - 20;
        setSpiderHeight(Math.max(calculated, 100));
      }
    };
    const observer = new ResizeObserver(syncHeights);
    if (aiBoxRef.current) observer.observe(aiBoxRef.current);
    if (leftCardRef.current) observer.observe(leftCardRef.current);
    syncHeights();
    return () => observer.disconnect();
  }, [aiVisible, archiveOpen, simulationActive, isMobile, activeText, viewMode]);

  const handleDownload = () => {
    const legacy = JSON.parse(localStorage.getItem("monthlyBriefings")) || [];
    const snapshots = getMonthlySnapshots() || [];
    const combined = [...legacy];
    snapshots.forEach(s => { if (!combined.find(b => b.date === s.date)) combined.push(s); });
    let data = combined;
    if (exportRange === "day") { const today = getTodayKey(); data = combined.filter(b => b.date === today); }
    else if (exportRange === "week") data = combined.slice(-7);
    if (!data.length) return alert("No data.");
    const text = data.map(b => `Day ${b.cycleDay} · ${b.date}\n\n${viewMode === "executive" ? b.executive : b.directive}`).join("\n\n---\n\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a"); a.href = url; a.download = `WealthyAI_${exportRange}.txt`; a.click();
  };

  const downloadPDF = async () => {
    if (!activeText) return;
    const res = await fetch("/api/export-month-pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: activeText, cycleDay, region }) });
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a"); a.href = url; a.download = "briefing.pdf"; a.click();
  };

  const sendEmailPDF = async () => {
    if (!activeText) return; setEmailSending(true);
    try { await fetch("/api/send-month-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: activeText, cycleDay, region }) }); }
    catch {} setEmailSending(false);
  };

  /* STÍLUSOK (Inline a 960 sor megtartásához) */
  const page = { minHeight: "100vh", backgroundColor: "#020617", color: "#f8fafc", fontFamily: "'Inter', sans-serif", padding: "20px" };
  const layout = { display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "20px", maxWidth: "1200px", margin: "0 auto" };
  const card = { background: "rgba(30, 41, 59, 0.5)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.05)" };
  const title = { fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px", margin: 0 };
  const subtitle = { opacity: 0.5, fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" };
  const aiTextStyle = { whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: "1.6", color: "#e2e8f0", background: "rgba(0,0,0,0.2)", padding: "15px", borderRadius: "8px", borderLeft: "3px solid #38bdf8" };
  const exportBtn = { background: "transparent", border: "1px solid #38bdf8", color: "#38bdf8", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", transition: "0.2s" };
  const aiButton = { background: "#38bdf8", color: "#020617", border: "none", padding: "10px 20px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", width: "100%" };
  const header = { marginBottom: "30px", textAlign: "center" };
  const signalBox = { background: "rgba(56, 189, 248, 0.05)", border: "1px solid rgba(56, 189, 248, 0.1)", padding: "15px", borderRadius: "12px", marginBottom: "20px" };
  const Divider = () => <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "20px 0" }} />;
  const Section = ({ title, children }) => <div style={{ marginBottom: "15px" }}><strong style={{ fontSize: "11px", opacity: 0.4, textTransform: "uppercase" }}>{title}</strong>{children}</div>;
  const Row = ({ label, value, onChange }) => <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0" }}><span style={{ fontSize: "14px", opacity: 0.8 }}>{label}</span><input type="number" value={value} onChange={e => onChange(e.target.value)} style={{ background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#38bdf8", textAlign: "right", width: "80px" }} /></div>;

  return (
    <div style={page}>
      <style>{`.ticker-container { width: 100%; overflow: hidden; padding: 10px 0; }.ticker-text { display: inline-block; white-space: nowrap; font-size: 10px; color: #38bdf8; animation: marquee 20s linear infinite; } @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>
      <div className="ticker-container"><div className="ticker-text">WEALTHY AI: INTERPRETATION OVER ADVICE • CLEARER THINKING • STRATEGIC FOCUS</div></div>
      
      <div style={header}>
        <h1 style={title}>WEALTHYAI · MONTHLY BRIEFING</h1>
        <p style={subtitle}>Strategic financial outlook · Next 90 days</p>
      </div>

      <div style={layout}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={card} ref={leftCardRef}>
            <h3>Structure</h3>
            <Section title="Income"><Row label="Monthly Net" value={inputs.income} onChange={v => update("income", v)} /></Section>
            <Section title="Living"><Row label="Housing" value={inputs.housing} onChange={v => update("housing", v)} /></Section>
            <Section title="Simulation">
              <input type="range" min="0" max="1" step="0.01" value={stressFactor} onChange={e => { setStressFactor(parseFloat(e.target.value)); setSimulationActive(true); }} style={{ width: "100%" }} />
            </Section>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              <button onClick={() => { setSimulationActive(true); setAiVisible(false); }} style={exportBtn}>SIMULATE</button>
              <button onClick={runAI} style={aiButton}>{loading ? "..." : "GENERATE"}</button>
            </div>
          </div>

          {!isMobile && (
            <div style={{ borderRadius: 16, overflow: 'hidden', background: "rgba(2,6,23,0.4)", height: `${spiderHeight}px`, transition: 'height 0.2s' }}>
              <SpiderNet isMobile={isMobile} height={spiderHeight} />
            </div>
          )}
        </div>

        <div style={card} ref={aiBoxRef}>
          {!aiVisible && !simulationActive && <div style={{ padding: "40px 0", textAlign: "center", opacity: 0.5 }}>Select a focus or generate briefing</div>}
          
          {simulationActive && !aiVisible && (
            <div>
              <h2 style={{ color: "#38bdf8" }}>{calculateFragility()}% Fragility</h2>
              <p style={{ fontSize: "14px", opacity: 0.7 }}>Structural stress at {Math.round(stressFactor * 100)}% pressure.</p>
              <button onClick={() => setSimulationActive(false)} style={{ ...exportBtn, marginTop: 10 }}>Reset</button>
            </div>
          )}

          {aiVisible && (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <button onClick={() => setViewMode("executive")} style={{ ...exportBtn, background: viewMode === "executive" ? "#38bdf8" : "transparent", color: viewMode === "executive" ? "#020617" : "#38bdf8" }}>Executive</button>
                <button onClick={() => setViewMode("directive")} style={{ ...exportBtn, background: viewMode === "directive" ? "#38bdf8" : "transparent", color: viewMode === "directive" ? "#020617" : "#38bdf8" }}>Directive</button>
              </div>
              <pre style={aiTextStyle}>{activeText}</pre>
              <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                <button onClick={downloadPDF} style={exportBtn}>PDF</button>
                <button onClick={sendEmailPDF} style={exportBtn}>{emailSending ? "..." : "Email"}</button>
                <button onClick={() => { setAiVisible(false); }} style={{ ...exportBtn, borderColor: "red", color: "red" }}>Close</button>
              </div>
            </div>
          )}

          <Divider />
          <button onClick={() => setArchiveOpen(!archiveOpen)} style={{ ...exportBtn, width: "100%" }}>{archiveOpen ? "Hide History" : "View History"}</button>
          {archiveOpen && (
            <div style={{ marginTop: 10, maxHeight: "200px", overflowY: "auto" }}>
              {getMonthlySnapshots().map(s => (
                <button key={s.date} onClick={() => { setSelectedDay(s.cycleDay); setAiVisible(true); setSimulationActive(false); }} style={{ ...exportBtn, width: "100%", textAlign: "left", marginBottom: "5px" }}>Day {s.cycleDay} - {s.date}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
/* ================= STYLES & HELPERS ================= */
const Section = ({ title, children }) => (
  <><Divider /><strong style={{fontSize: 14, color: "#7dd3fc", display: "block", marginBottom: 8}}>{title}</strong>{children}</>
);

const Row = ({ label, value, onChange }) => (
  <div style={row}>
    <span style={{fontSize: 13, opacity: 0.8}}>{label}</span>
    <input type="number" value={value} onChange={e => onChange(e.target.value)} style={rowInput} />
  </div>
);

const Label = ({ children }) => (
  <label style={{ marginBottom: 6, display: "block", fontSize: 13, opacity: 0.8 }}>{children}</label>
);

const Input = ({ value, onChange }) => (
  <input type="number" value={value} onChange={onChange} style={input} />
);

const Divider = () => (
  <div style={{ height: 1, background: "#1e293b", margin: "16px 0" }} />
);

const page = {
  minHeight: "100vh", 
  position: "relative", 
  padding: "40px 20px", 
  color: "#e5e7eb", 
  fontFamily: "Inter, system-ui", 
  backgroundColor: "#020617",
  backgroundImage: `repeating-linear-gradient(-25deg, rgba(56,189,248,0.04) 0px, rgba(56,189,248,0.04) 1px, transparent 1px, transparent 180px), repeating-linear-gradient(35deg, rgba(167,139,250,0.04) 0px, rgba(167,139,250,0.04) 1px, transparent 1px, transparent 260px), radial-gradient(circle at 20% 30%, rgba(56,189,248,0.14), transparent 45%), radial-gradient(circle at 80% 60%, rgba(167,139,250,0.14), transparent 50%), url("/wealthyai/icons/generated.png")`,
  backgroundRepeat: "repeat, repeat, no-repeat, no-repeat, repeat", 
  backgroundSize: "auto, auto, 100% 100%, 100% 100%, 420px auto",
};

const header = { textAlign: "center", marginBottom: 20 };
const title = { fontSize: "2rem", margin: 0, fontWeight: "800", letterSpacing: "-0.02em" };
const subtitle = { marginTop: 8, color: "#cbd5f5", fontSize: 14 };

const helpButton = { position: "absolute", top: 20, right: 20, padding: "6px 12px", borderRadius: 8, fontSize: 12, textDecoration: "none", color: "#7dd3fc", border: "1px solid #1e293b", background: "rgba(2,6,23,0.7)" };

const regionRow = { display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 };
const regionLabel = { color: "#7dd3fc", fontSize: 14, alignSelf: "center" };
const regionSelect = { background: "#020617", color: "#e5e7eb", border: "1px solid #1e293b", padding: "4px 8px", borderRadius: 6 };

const signalBox = { maxWidth: 800, margin: "0 auto 15px", padding: 14, border: "1px solid #1e293b", borderRadius: 12, background: "rgba(2,6,23,0.75)" };

const layout = { 
  display: "grid", 
  gridTemplateColumns: "1fr 1.3fr", 
  gap: 25, 
  maxWidth: 1100, 
  margin: "0 auto",
  alignItems: 'start' // Fontos: ne feszítse ki alapból a dobozokat
};

const card = { 
  padding: 20, 
  borderRadius: 16, 
  border: "1px solid #1e293b", 
  background: "rgba(2,6,23,0.78)", 
  height: "fit-content" 
};

const input = { width: "100%", padding: 10, marginTop: 4, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, color: "white", outline: "none" };
const row = { display: "flex", justifyContent: "space-between", marginTop: 8 };
const rowInput = { width: 85, background: "transparent", border: "none", borderBottom: "1px solid #38bdf8", color: "#38bdf8", textAlign: "right", outline: "none" };

const aiButton = { marginTop: 20, width: "100%", padding: 12, background: "#38bdf8", border: "none", borderRadius: 10, fontWeight: "bold", cursor: "pointer", color: "#020617" };
const aiTextStyle = { marginTop: 10, whiteSpace: "pre-wrap", color: "#cbd5f5", fontSize: 14, lineHeight: "1.7", fontFamily: "Inter, sans-serif" };

const exportBtn = { padding: "8px 14px", borderRadius: 8, border: "1px solid #1e293b", background: "transparent", color: "#38bdf8", cursor: "pointer", fontSize: 13, transition: "all 0.2s" };
const exportSelect = { background: "transparent", color: "#e5e7eb", border: "1px solid #1e293b", padding: "8px", borderRadius: 8, outline: "none" };

const footer = { marginTop: 40, textAlign: "center", fontSize: 12, color: "#64748b" };
