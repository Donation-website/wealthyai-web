import { useState, useEffect, useRef } from "react";
import {
  saveMonthlySnapshot,
  getMonthlySnapshots,
  getSnapshotByDay,
} from "../lib/monthlyArchive";

/* ==========================================================================
   SPIDERNET COMPONENT (HD & ULTRA DENSE)
   - JAVÍTVA: Mobilon teljesen tiltva (null return)
   - JAVÍTVA: Egér interakció engedélyezve (pointer-events: auto)
   - JAVÍTVA: Dinamikus magasság-követés
   ========================================================================== */
function SpiderNet({ isMobile, height }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Szigorú tiltás mobilra és nulla magasságra
    if (isMobile || !height || height < 20) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let particles = [];
    // Ultra Dense beállítások a látványos hálóért
    const particleCount = 280; 
    const connectionDistance = 155; 
    const mouse = { 
      x: null, 
      y: null, 
      radius: 170 
    };

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

    // Egér eseménykezelők az interakcióhoz
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
        const rect = canvas.parentElement.getBoundingClientRect();
        this.x = Math.random() * rect.width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.6 + 0.4;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
      }

      draw() {
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      update() {
        const rect = canvas.parentElement.getBoundingClientRect();
        
        this.x += this.vx;
        this.y += this.vy;

        // Ütközés a falakkal
        if (this.x < 0 || this.x > rect.width) {
          this.vx *= -1;
        }
        if (this.y < 0 || this.y > height) {
          this.vy *= -1;
        }
        
        // Egér taszítás logika
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= (dx / distance) * force * 2.8;
            this.y -= (dy / distance) * force * 2.8;
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
            ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.55})`;
            ctx.lineWidth = 0.85;
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
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, height]);

  // Mobilon nem renderelünk semmit
  if (isMobile) {
    return null;
  }

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        display: 'block',
        width: '100%', 
        height: `${height}px`,
        background: 'transparent',
        pointerEvents: 'auto',
        cursor: 'crosshair'
      }} 
    />
  );
}

/* ==========================================================================
   HELPER FUNCTIONS (Time, Region, Key Gen)
   ========================================================================== */
const DAILY_SIGNAL_KEY = "dailySignalUnlock";

function getTodayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function getDailyUnlockTime() {
  const stored = JSON.parse(localStorage.getItem(DAILY_SIGNAL_KEY) || "{}");
  const today = getTodayKey();

  if (stored.date === today) {
    return stored.unlockAt;
  }

  // Véletlenszerű reggeli nyitás generálása
  const hour = Math.floor(Math.random() * 10) + 7; 
  const minute = Math.floor(Math.random() * 60);

  const unlockAt = new Date();
  unlockAt.setHours(hour, minute, 0, 0);

  localStorage.setItem(
    DAILY_SIGNAL_KEY,
    JSON.stringify({ 
      date: today, 
      unlockAt: unlockAt.getTime() 
    })
  );

  return unlockAt.getTime();
}

const REGIONS = [
  { code: "US", label: "United States" },
  { code: "EU", label: "European Union" },
  { code: "UK", label: "United Kingdom" },
  { code: "HU", label: "Hungary" },
  { code: "OTHER", label: "Other regions" },
];

/* ==========================================================================
   MAIN COMPONENT START
   ========================================================================== */
export default function PremiumMonth() {
  // Device & Layout Refs
  const [isMobile, setIsMobile] = useState(false);
  const aiBoxRef = useRef(null);
  const [aiBoxHeight, setAiBoxHeight] = useState(0);

  // Simulation Logic
  const [simulationActive, setSimulationActive] = useState(false);
  const [stressFactor, setStressFactor] = useState(0); 

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  /* ==========================================================================
     SUBSCRIPTION & ACCESS CONTROL
     ========================================================================== */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    
    if (!sessionId) {
      window.location.href = "/start";
      return;
    }

    const verifyAccess = async () => {
      try {
        const response = await fetch("/api/verify-active-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await response.json();
        if (!data.valid) {
          window.location.href = "/start";
        }
      } catch (error) {
        console.error("Verification failed", error);
        window.location.href = "/start";
      }
    };

    verifyAccess();
  }, []);

  /* ==========================================================================
     STATE DEFINITIONS (CORE LOGIC)
     ========================================================================== */
  const [region, setRegion] = useState("EU");
  const [country, setCountry] = useState(null);
  const [viewMode, setViewMode] = useState("executive");
  const [cycleDay, setCycleDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  
  // AI Panel és láthatóság
  const [aiVisible, setAiVisible] = useState(false);
  const [aiCollapsed, setAiCollapsed] = useState(true);

  // Napi szignál és adatok
  const [dailySignal, setDailySignal] = useState(null);
  const [dailyPending, setDailyPending] = useState(true);
  const [dailyDual, setDailyDual] = useState(null);
  const [dailySnapshot, setDailySnapshot] = useState(null);
  const [isTodayAvailable, setIsTodayAvailable] = useState(false);

  // Archívum és kiválasztás
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [exportRange, setExportRange] = useState("day");

  /* ==========================================================================
     FINANCIAL INPUTS STATE
     ========================================================================== */
  const [inputs, setInputs] = useState({
    income: 4000,
    housing: 1200,
    electricity: 120,
    gas: 90,
    water: 40,
    internet: 60,
    mobile: 40,
    tv: 30,
    insurance: 150,
    banking: 20,
    unexpected: 200,
    other: 300,
  });

  const update = (key, value) => {
    setInputs((prev) => ({ 
      ...prev, 
      [key]: Number(value) 
    }));
    // Bármilyen módosítás esetén alaphelyzetbe állítjuk az AI nézetet
    setAiVisible(false);
    setAiCollapsed(true);
    setDailyDual(null);
    setDailySnapshot(null);
    setSelectedDay(null);
  };

  /* ==========================================================================
     WEEKLY FOCUS SYSTEM
     ========================================================================== */
  const WEEK_LENGTH = 7;
  const [weeklyFocus, setWeeklyFocus] = useState(() => {
    try {
      const saved = localStorage.getItem("weeklyFocus");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [focusOpen, setFocusOpen] = useState(false);
  const [focusPreview, setFocusPreview] = useState(null);

  const FOCUS_OPTIONS = [
    { key: "stability", label: "Financial Stability" },
    { key: "spending", label: "Spending Behavior" },
    { key: "resilience", label: "Crisis Resilience" },
    { key: "direction", label: "Strategic Direction" },
  ];

  const getCurrentWeekIndex = () => {
    return Math.floor((cycleDay - 1) / WEEK_LENGTH);
  };

  const confirmWeeklyFocus = () => {
    if (!focusPreview) return;
    const focusData = {
      key: focusPreview,
      weekIndex: getCurrentWeekIndex(),
      timestamp: Date.now(),
    };
    setWeeklyFocus(focusData);
    localStorage.setItem("weeklyFocus", JSON.stringify(focusData));
    setFocusPreview(null);
  };

  /* ==========================================================================
     CYCLE & REGION EFFECTS
     ========================================================================== */
  useEffect(() => {
    const start = localStorage.getItem("subscriptionPeriodStart") || localStorage.getItem("monthCycleStart");
    if (!start) {
      const now = Date.now().toString();
      localStorage.setItem("monthCycleStart", now);
      setCycleDay(1);
    } else {
      const diffDays = Math.floor((Date.now() - Number(start)) / 86400000);
      setCycleDay(Math.min(diffDays + 1, 30));
    }
  }, []);

  useEffect(() => {
    const detectRegion = async () => {
      try {
        const r = await fetch("/api/detect-region");
        const j = await r.json();
        if (j?.region) setRegion(j.region);
        if (j?.country) setCountry(j.country);
      } catch (e) {
        console.warn("Region detection unavailable");
      }
    };
    detectRegion();
  }, []);

  /* ==========================================================================
     AI BRIEFING RUNNERS
     ========================================================================== */
  const runAI = async () => {
    setLoading(true);
    setSelectedDay(null);
    setSimulationActive(false);

    try {
      const res = await fetch("/api/get-ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          country,
          cycleDay,
          weeklyFocus: weeklyFocus?.key,
          ...inputs,
        }),
      });

      const json = await res.json();
      if (json?.snapshot) {
        setDailyDual(json.snapshot);
        setViewMode("executive");
        setAiVisible(true);
        setAiCollapsed(false);
        
        // Mentés a lokális listába
        const today = getTodayKey();
        const stored = JSON.parse(localStorage.getItem("monthlyBriefings")) || [];
        if (!stored.find(b => b.date === today)) {
          stored.push({
            id: Date.now(),
            date: today,
            cycleDay,
            executive: json.snapshot.executive,
            directive: json.snapshot.directive,
          });
          localStorage.setItem("monthlyBriefings", JSON.stringify(stored.slice(-30)));
        }
      }
    } catch (err) {
      console.error("AI Briefing error", err);
    } finally {
      setLoading(false);
    }
  };

  const runAIDual = async () => {
    if (!isTodayAvailable) {
      alert("Today's financial snapshot is still being processed by the network.");
      return;
    }
    setLoading(true);
    setSelectedDay(null);
    setSimulationActive(false);

    try {
      const res = await fetch("/api/get-ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          country,
          cycleDay,
          weeklyFocus: weeklyFocus?.key,
          ...inputs,
        }),
      });

      const data = await res.json();
      if (data?.snapshot) {
        saveMonthlySnapshot(data.snapshot);
        setDailySnapshot(data.snapshot);
        setViewMode("executive");
        setAiVisible(true);
        setAiCollapsed(false);
      }
    } catch (err) {
      console.error("Snapshot error", err);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================================
     CALCULATIONS (FRAGILITY INDEX)
     ========================================================================== */
  const calculateFragility = () => {
    const energyCosts = (inputs.electricity + inputs.gas) * (1 + stressFactor);
    const fixedCosts = inputs.housing + inputs.insurance + inputs.banking + energyCosts;
    const ratio = (fixedCosts / inputs.income) * 100;
    return Math.min(Math.max(ratio, 0), 100).toFixed(1);
  };
  /* ==========================================================================
     ACTIVE CONTENT RESOLUTION & HEIGHT TRACKING
     ========================================================================== */
  const activeSnapshot = selectedDay
    ? getSnapshotByDay(selectedDay)
    : dailySnapshot;

  const activeDual = activeSnapshot || dailyDual;

  const activeText =
    activeDual &&
    (viewMode === "executive"
      ? activeDual.executive
      : activeDual.directive);

  // Amőba magasságának precíziós követése az AI dobozhoz
  useEffect(() => {
    if (aiVisible && aiBoxRef.current) {
      const updateHeight = () => {
        if (aiBoxRef.current) {
          // Pixelenkénti pontosság pufferrel a dinamikus szöveghez
          const currentHeight = aiBoxRef.current.offsetHeight;
          setAiBoxHeight(currentHeight);
        }
      };
      
      updateHeight();
      
      // Figyeljük a szöveg betöltődését egy rövid időzítővel is
      const timeoutId = setTimeout(updateHeight, 150);
      
      // ResizeObserver használata a legpontosabb követésért
      const observer = new ResizeObserver(updateHeight);
      observer.observe(aiBoxRef.current);
      
      return () => {
        clearTimeout(timeoutId);
        observer.disconnect();
      };
    }
  }, [aiVisible, activeText, viewMode, archiveOpen]);

  /* ==========================================================================
     EXPORT & DATA PERSISTENCE
     ========================================================================== */
  const handleDownload = () => {
    const legacy = JSON.parse(localStorage.getItem("monthlyBriefings")) || [];
    const snapshots = getMonthlySnapshots() || [];
    const combined = [...legacy, ...snapshots];
    
    let filtered = combined;
    if (exportRange === "day") {
      filtered = combined.filter(b => b.date === getTodayKey());
    } else if (exportRange === "week") {
      filtered = combined.slice(-7);
    }

    if (!filtered.length) {
      alert("No saved intelligence data found for the selected range.");
      return;
    }

    const textContent = filtered
      .map(b => `[${b.date}] DAY ${b.cycleDay}\n${viewMode === "executive" ? b.executive : b.directive}`)
      .join("\n\n" + "=".repeat(30) + "\n\n");

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `WealthyAI_Intelligence_${exportRange}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    if (!activeText) return;
    try {
      const response = await fetch("/api/export-month-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: activeText, cycleDay, region }),
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `WealthyAI_Analysis_Day_${cycleDay}.pdf`;
      a.click();
    } catch (e) {
      console.error("PDF Export failed");
    }
  };

  const sendEmailPDF = async () => {
    if (!activeText) return;
    setEmailSending(true);
    try {
      await fetch("/api/send-month-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: activeText, cycleDay, region }),
      });
      alert("Intelligence brief sent to your registered email.");
    } catch (e) {
      alert("Email delivery failed. Please try again.");
    } finally {
      setEmailSending(false);
    }
  };

  /* ==========================================================================
     RENDER PHASE (UI STRUCTURE)
     ========================================================================== */
  return (
    <div style={{ ...page, backgroundAttachment: "fixed" }}>
      {/* DINAMIKUS FUTÓFÉNY STÍLUSOK */}
      <style>{`
        .ticker-container {
          width: 100%;
          overflow: hidden;
          background: transparent;
          padding: 8px 0;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(56, 189, 248, 0.05);
        }
        .ticker-text {
          display: inline-block;
          white-space: nowrap;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(255, 255, 255, 0.35);
          animation: marquee 30s linear infinite;
        }
        .ticker-text span { margin-right: 60px; font-weight: 500; }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* TICKER DISPLAY */}
      <div className="ticker-container">
        <div className="ticker-text">
          <span>Wealthy AI: We don’t advise, we interpret</span>
          <span>Clearer thinking, not just faster decisions</span>
          <span>Rewarding attention over speed</span>
          <span>Supporting your judgment, quietly</span>
          <span>Wealthy AI: We don’t advise, we interpret</span>
        </div>
      </div>

      <a href="/month/help" style={helpButton}>Help & Protocol</a>

      <div style={header}>
        <h1 style={title}>WEALTHYAI · MONTHLY BRIEFING</h1>
        <p style={subtitle}>Financial Insight Engine · Strategic Cycle: {cycleDay}/30</p>
      </div>

      <div style={regionRow}>
        <span style={regionLabel}>Active Region:</span>
        <select value={region} onChange={e => setRegion(e.target.value)} style={regionSelect}>
          {REGIONS.map(r => (
            <option key={r.code} value={r.code}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* SYSTEM SIGNALS */}
      <div style={signalBox}>
        <strong style={{ color: "#38bdf8", fontSize: 11 }}>SYSTEM STATUS</strong>
        <p style={{ margin: "5px 0 0", fontSize: 13 }}>Day {cycleDay} of the 30-day structural analysis cycle.</p>
      </div>

      <div style={signalBox}>
        <strong style={{ color: "#38bdf8", fontSize: 11 }}>MARKET SIGNAL</strong>
        {dailyPending ? (
          <p style={{ margin: "5px 0 0", opacity: 0.6 }}>Synchronizing with regional data points...</p>
        ) : (
          <p style={{ margin: "5px 0 0" }}>{dailySignal}</p>
        )}
      </div>

      {/* FOCUS CONTROL */}
      <div style={signalBox}>
        <strong style={{ color: "#38bdf8", fontSize: 11 }}>STRATEGIC FOCUS</strong>
        <p style={{ margin: "5px 0 10px", opacity: 0.8, fontSize: 13 }}>
          {weeklyFocus ? `Current priority: ${weeklyFocus.key.toUpperCase()}` : "No focus area selected for this week."}
        </p>
        <button onClick={() => setFocusOpen(!focusOpen)} style={exportBtn}>
          {focusOpen ? "Close Control" : (weeklyFocus ? "Change Priority" : "Define Focus")}
        </button>

        {focusOpen && (
          <div style={{ marginTop: 15, animation: "fadeIn 0.3s ease" }}>
            {FOCUS_OPTIONS.map((f, i) => (
              <button
                key={f.key}
                disabled={i < getCurrentWeekIndex()}
                onClick={() => setFocusPreview(f.key)}
                style={{
                  ...exportBtn,
                  display: "block",
                  width: "100%",
                  marginBottom: 6,
                  textAlign: "left",
                  background: focusPreview === f.key ? "rgba(56, 189, 248, 0.2)" : "transparent",
                  borderColor: focusPreview === f.key ? "#38bdf8" : "#1e293b"
                }}
              >
                {f.label} {weeklyFocus?.key === f.key ? " (Active)" : ""}
              </button>
            ))}
            {focusPreview && (
              <button onClick={confirmWeeklyFocus} style={{ ...aiButton, marginTop: 10 }}>Confirm Strategic Selection</button>
            )}
          </div>
        )}
      </div>

      {/* MAIN INTERFACE LAYOUT */}
      <div style={{ 
        ...layout, 
        gridTemplateColumns: isMobile ? "1fr" : layout.gridTemplateColumns,
        gap: isMobile ? 25 : layout.gap 
      }}>
        
        {/* LEFT COLUMN: DATA & AMŐBA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={card}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, letterSpacing: 1 }}>DATA ARCHITECTURE</h3>
            
            <Label>Monthly Gross Income</Label>
            <Input value={inputs.income} onChange={e => update("income", e.target.value)} />
            
            <Section title="Structural Living">
              <Row label="Housing / Rent" value={inputs.housing} onChange={v => update("housing", v)} />
              <Row label="Insurance" value={inputs.insurance} onChange={v => update("insurance", v)} />
            </Section>

            <Section title="Operational Costs">
              <Row label="Electricity" value={inputs.electricity} onChange={v => update("electricity", v)} />
              <Row label="Gas / Heating" value={inputs.gas} onChange={v => update("gas", v)} />
              <Row label="Water / Waste" value={inputs.water} onChange={v => update("water", v)} />
            </Section>

            <Section title="Digital & Finance">
              <Row label="Connectivity" value={inputs.internet} onChange={v => update("internet", v)} />
              <Row label="Banking Fees" value={inputs.banking} onChange={v => update("banking", v)} />
            </Section>

            <Divider />

            <div style={{ padding: "10px 0" }}>
              <strong style={{ color: "#10b981", fontSize: 12, display: "block", marginBottom: 12 }}>STRESS TEST SIMULATION</strong>
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={stressFactor}
                onChange={(e) => { setStressFactor(parseFloat(e.target.value)); setSimulationActive(true); }}
                style={{ width: "100%", accentColor: "#10b981", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, opacity: 0.5, marginTop: 6 }}>
                <span>NOMINAL</span>
                <span>CRITICAL (+100%)</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
              <button 
                onClick={() => { setSimulationActive(true); setAiVisible(false); }}
                style={{ ...exportBtn, borderColor: "#10b981", color: "#10b981" }}
              >
                SIMULATE
              </button>
              <button onClick={runAI} style={{ ...aiButton, marginTop: 0 }}>
                {loading ? "PROCESSING..." : "GENERATE AI"}
              </button>
            </div>

            <button onClick={runAIDual} style={{ ...exportBtn, marginTop: 12, width: "100%" }}>
              Lock Monthly Snapshot
            </button>
          </div>

          {/* JAVÍTOTT AMŐBA KONTÉNER: NINCS KERET, DINAMIKUS MAGASSÁG */}
          {aiVisible && !selectedDay && !isMobile && (
            <div style={{ 
              borderRadius: 20, 
              overflow: 'hidden', 
              background: "transparent",
              transition: "height 0.3s ease-out"
            }}>
              <SpiderNet isMobile={isMobile} height={aiBoxHeight} />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INTELLIGENCE OUTPUT */}
        <div style={card} ref={aiBoxRef}>
          {!aiVisible && !simulationActive && (
            <div style={{ padding: "15px", animation: "fadeIn 0.8s ease" }}>
              <h2 style={{ fontSize: 24, margin: "0 0 15px" }}>Intelligence Framework</h2>
              <p style={{ opacity: 0.7, lineHeight: "1.8", fontSize: 14 }}>
                WealthyAI provides interpretation, not financial advice. Our objective is to provide
                structural clarity, allowing you to observe your financial patterns without the noise 
                of traditional forecasting. 
              </p>
              <p style={{ opacity: 0.7, lineHeight: "1.8", fontSize: 14, marginTop: 15 }}>
                Every data point you provide strengthens the interpretation of your current 30-day cycle.
              </p>
            </div>
          )}

          {simulationActive && !aiVisible && (
            <div style={{ padding: "15px", animation: "fadeIn 0.4s ease" }}>
              <strong style={{ color: "#10b981", fontSize: 12 }}>LIVE FRAGILITY RATIO</strong>
              <div style={{ fontSize: 56, fontWeight: "900", color: "#38bdf8", margin: "20px 0" }}>
                {calculateFragility()}%
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ 
                  height: "100%", 
                  width: `${calculateFragility()}%`, 
                  background: "linear-gradient(90deg, #10b981, #38bdf8)",
                  transition: "width 0.4s cubic-bezier(0.17, 0.67, 0.83, 0.67)" 
                }} />
              </div>
              <p style={{ opacity: 0.6, fontSize: 13, marginTop: 20, lineHeight: "1.6" }}>
                Simulated stress level: {Math.round(stressFactor * 100)}%. Your financial rigidity 
                {parseFloat(calculateFragility()) > 60 ? " suggests high structural risk." : " remains within safe boundaries."}
              </p>
              <button onClick={() => setSimulationActive(false)} style={{ ...exportBtn, marginTop: 25 }}>Reset Environment</button>
            </div>
          )}

          {aiVisible && (
            <div style={{ animation: "fadeIn 0.5s ease" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <button onClick={() => setViewMode("executive")} style={{ ...exportBtn, flex: 1, background: viewMode === "executive" ? "#38bdf8" : "transparent", color: viewMode === "executive" ? "#020617" : "#38bdf8" }}>Executive Brief</button>
                <button onClick={() => setViewMode("directive")} style={{ ...exportBtn, flex: 1, background: viewMode === "directive" ? "#38bdf8" : "transparent", color: viewMode === "directive" ? "#020617" : "#38bdf8" }}>Directive View</button>
              </div>

              <pre style={aiTextStyle}>{activeText}</pre>

              {!selectedDay && (
                <div style={{ marginTop: 25, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <select value={exportRange} onChange={e => setExportRange(e.target.value)} style={exportSelect}>
                    <option value="day">Today's Brief</option>
                    <option value="week">Weekly View</option>
                    <option value="month">Full Cycle</option>
                  </select>
                  <button onClick={handleDownload} style={exportBtn}>Export Text</button>
                  <button onClick={downloadPDF} style={exportBtn}>PDF</button>
                  <button onClick={sendEmailPDF} style={exportBtn}>{emailSending ? "Sending..." : "Email PDF"}</button>
                </div>
              )}
            </div>
          )}

          <Divider />
          
          <button onClick={() => setArchiveOpen(!archiveOpen)} style={{ ...exportBtn, width: "100%", borderStyle: "dashed" }}>
            {archiveOpen ? "Close Intelligence Archive" : "Access Past Snapshots"}
          </button>
          
          {archiveOpen && (
            <div style={{ marginTop: 15, display: "flex", flexDirection: "column", gap: 6 }}>
              {getMonthlySnapshots().map(s => (
                <button 
                  key={s.date} 
                  onClick={() => { setSelectedDay(s.cycleDay); setAiVisible(true); setSimulationActive(false); }} 
                  style={{ ...exportBtn, textAlign: "left", fontSize: 12 }}
                >
                  Day {s.cycleDay} — {s.date} (Snapshot)
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={footer}>
        <p>© 2026 WealthyAI Intelligence Terminal</p>
        <p style={{ opacity: 0.5, fontSize: 10, marginTop: 5 }}>Non-Advisory Interpretative System v3.4.2</p>
      </div>
    </div>
  );
}

/* ==========================================================================
   STYLING DEFINITIONS (VÉGLEGES, MASSZÍV LISTA)
   ========================================================================== */
const Section = ({ title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <Divider />
    <strong style={{ fontSize: 12, color: "#7dd3fc", textTransform: "uppercase", letterSpacing: 1 }}>{title}</strong>
    <div style={{ marginTop: 10 }}>{children}</div>
  </div>
);

const Row = ({ label, value, onChange }) => (
  <div style={row}>
    <span style={{ fontSize: 13, opacity: 0.75 }}>{label}</span>
    <input 
      type="number" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      style={rowInput} 
    />
  </div>
);

const Label = ({ children }) => (
  <label style={{ marginBottom: 8, display: "block", fontSize: 12, opacity: 0.6, textTransform: "uppercase" }}>{children}</label>
);

const Input = ({ value, onChange }) => (
  <input 
    type="number" 
    value={value} 
    onChange={onChange} 
    style={input} 
  />
);

const Divider = () => (
  <div style={{ height: 1, background: "rgba(30, 41, 59, 0.5)", margin: "15px 0" }} />
);

// Konstans stílus objektumok a kód méretének növeléséhez és tisztaságához
const page = {
  minHeight: "100vh", padding: "40px 20px", color: "#e5e7eb", fontFamily: "'Inter', sans-serif", 
  backgroundColor: "#020617",
  backgroundImage: `radial-gradient(circle at 15% 15%, rgba(56,189,248,0.08), transparent 40%), radial-gradient(circle at 85% 85%, rgba(167,139,250,0.08), transparent 40%)`
};

const header = { textAlign: "center", marginBottom: 30 };
const title = { fontSize: "2.4rem", margin: 0, fontWeight: "900", letterSpacing: "-0.03em", color: "#f8fafc" };
const subtitle = { marginTop: 10, color: "#94a3b8", fontSize: 15, fontWeight: "400" };

const helpButton = { position: "absolute", top: 25, right: 25, padding: "8px 16px", borderRadius: 12, fontSize: 11, textDecoration: "none", color: "#7dd3fc", border: "1px solid rgba(56, 189, 248, 0.2)", background: "rgba(2, 6, 23, 0.8)", fontWeight: "600", backdropFilter: "blur(4px)" };

const regionRow = { display: "flex", justifyContent: "center", gap: 12, marginBottom: 25 };
const regionLabel = { color: "#94a3b8", fontSize: 13, alignSelf: "center" };
const regionSelect = { background: "#0f172a", color: "#f8fafc", border: "1px solid #1e293b", padding: "6px 12px", borderRadius: 8, fontSize: 13, outline: "none" };

const signalBox = { maxWidth: 800, margin: "0 auto 15px", padding: "18px", border: "1px solid rgba(30, 41, 59, 0.7)", borderRadius: 16, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(8px)" };

const layout = { display: "grid", gridTemplateColumns: "400px 1fr", gap: 30, maxWidth: 1200, margin: "0 auto" };
const card = { padding: "25px", borderRadius: 24, border: "1px solid rgba(30, 41, 59, 0.8)", background: "rgba(15, 23, 42, 0.6)", height: "fit-content", boxShadow: "0 10px 30px -15px rgba(0,0,0,0.5)" };

const input = { width: "100%", padding: "12px", marginBottom: "15px", background: "rgba(2, 6, 23, 0.5)", border: "1px solid #1e293b", borderRadius: 12, color: "#fff", fontSize: 14, outline: "none", transition: "border-color 0.2s" };
const row = { display: "flex", justifyContent: "space-between", marginTop: 10, alignItems: "center" };
const rowInput = { width: "90px", background: "transparent", border: "none", borderBottom: "1px solid #334155", color: "#38bdf8", textAlign: "right", padding: "4px", fontSize: 14, outline: "none", fontWeight: "600" };

const aiButton = { width: "100%", padding: "14px", background: "#38bdf8", border: "none", borderRadius: 14, fontWeight: "800", cursor: "pointer", color: "#020617", fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", transition: "transform 0.1s" };
const aiTextStyle = { marginTop: 15, whiteSpace: "pre-wrap", color: "#cbd5e1", fontSize: 14, lineHeight: "1.8", fontFamily: "'Inter', sans-serif", padding: "15px", background: "rgba(2, 6, 23, 0.3)", borderRadius: 16, border: "1px solid rgba(56, 189, 248, 0.1)" };

const exportBtn = { padding: "10px 18px", borderRadius: 12, border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 12, fontWeight: "600", transition: "all 0.2s" };
const exportSelect = { background: "#0f172a", color: "#f8fafc", border: "1px solid #334155", padding: "10px", borderRadius: 12, fontSize: 12, outline: "none" };

const footer = { marginTop: 60, textAlign: "center", fontSize: 11, color: "#475569", paddingBottom: 40 };
