import { useState, useEffect, useRef } from "react";
import {
  saveMonthlySnapshot,
  getMonthlySnapshots,
  getSnapshotByDay,
} from "../lib/monthlyArchive";

/* ================= SPIDERNET COMPONENT (HD & ULTRA DENSE) ================= */
/* Dinamikusan követi az AI ablak alját, keret nélkül, kurzorra mozdul */
function SpiderNet({ isMobile, height }) {
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Szigorú tiltás mobilra
    if (isMobile || !height || height < 10) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let particles = [];
    // Ultra dense beállítás: több részecske, komolyabb háló
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

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("mouseenter", handleMouseEnter);

    class Particle {
      constructor() {
        const rect = canvas.getBoundingClientRect();
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
        const rect = canvas.getBoundingClientRect();
        
        // Amőba mozgás kurzor rátoláskor (sebesség növelése)
        const currentSpeed = isHovered ? 2.2 : 1;
        this.x += this.vx * currentSpeed;
        this.y += this.vy * currentSpeed;

        if (this.x < 0 || this.x > (rect.width || 500)) this.vx *= -1;
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
        height: `${height}px`,
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

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDailyUnlockTime() {
  const stored = JSON.parse(localStorage.getItem(DAILY_SIGNAL_KEY) || "{}");
  const today = getTodayKey();

  if (stored.date === today) return stored.unlockAt;

  const hour = Math.floor(Math.random() * 10) + 7; // 07–16
  const minute = Math.floor(Math.random() * 60);

  const unlockAt = new Date();
  unlockAt.setHours(hour, minute, 0, 0);

  localStorage.setItem(
    DAILY_SIGNAL_KEY,
    JSON.stringify({ date: today, unlockAt: unlockAt.getTime() })
  );

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
  // Device detection
  const [isMobile, setIsMobile] = useState(false);
  // Ref az AI dobozhoz a magasság méréséhez
  const aiBoxRef = useRef(null);
  const [aiBoxHeight, setAiBoxHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  /* ================= SIMULATION & STRESS STATE ================= */
  const [simulationActive, setSimulationActive] = useState(false);
  const [stressFactor, setStressFactor] = useState(0); 

  const calculateFragility = () => {
    const energy = (inputs.electricity + inputs.gas) * (1 + stressFactor);
    const fixed = inputs.housing + inputs.insurance + inputs.banking + energy;
    const ratio = (fixed / inputs.income) * 100;
    return Math.min(Math.max(ratio, 0), 100).toFixed(1);
  };
  /* ================= CORE CONFIG & UI STATE ================= */
  const [region, setRegion] = useState("EU");
  const [country, setCountry] = useState(null);
  const [viewMode, setViewMode] = useState("executive"); // executive | directive
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
  const [exportRange, setExportRange] = useState("day"); // day | week | month
  const [isTodayAvailable, setIsTodayAvailable] = useState(false);

  /* ================= FINANCIAL INPUTS ================= */
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

  /* ================= WEEKLY FOCUS LOGIC ================= */
  const FOCUS_OPTIONS = [
    { key: "resilience", label: "Structural Resilience" },
    { key: "efficiency", label: "Capital Efficiency" },
    { key: "growth", label: "Long-term Growth" },
    { key: "liquidity", label: "Liquidity Buffer" },
  ];

  const [weeklyFocus, setWeeklyFocus] = useState(null);
  const [focusOpen, setFocusOpen] = useState(false);
  const [focusPreview, setFocusPreview] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("wealthy_weekly_focus");
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date();
      const savedDate = new Date(parsed.timestamp);
      const diff = (today - savedDate) / (1000 * 60 * 60 * 24);
      if (diff < 7) setWeeklyFocus(parsed);
    }
  }, []);

  const getCurrentWeekIndex = () => {
    const day = new Date().getDate();
    return Math.floor((day - 1) / 7);
  };

  const confirmWeeklyFocus = () => {
    const data = { key: focusPreview, timestamp: new Date().getTime() };
    setWeeklyFocus(data);
    localStorage.setItem("wealthy_weekly_focus", JSON.stringify(data));
    setFocusOpen(false);
  };

  /* ================= DYNAMIC HEIGHT OBSERVER ================= */
  // Ez figyeli az AI doboz magasságát, hogy a SpiderNet pontosan kövesse
  useEffect(() => {
    if (!isMobile && aiVisible && aiBoxRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setAiBoxHeight(entry.contentRect.height);
        }
      });

      observer.observe(aiBoxRef.current);
      return () => observer.disconnect();
    }
  }, [aiVisible, isMobile]);
  /* ================= INITIALIZATION & SIGNALS ================= */
  useEffect(() => {
    const day = Math.min(new Date().getDate(), 30);
    setCycleDay(day);

    const unlockAt = getDailyUnlockTime();
    const checkSignal = () => {
      const now = new Date().getTime();
      if (now >= unlockAt) {
        setDailyPending(false);
        const signals = [
          "Structural integrity remains stable. Monitoring energy volatility.",
          "Defensive posture recommended. Global indices showing friction.",
          "Liquidity consolidation phase. Watch for service inflation.",
          "Optimization window opening. Core structural costs are primary.",
          "Standard cycle movement. No immediate divergence detected."
        ];
        setDailySignal(signals[day % signals.length]);
      } else {
        setDailyPending(true);
      }
    };

    checkSignal();
    const timer = setInterval(checkSignal, 60000);

    const today = getTodayKey();
    const snapshots = getMonthlySnapshots() || [];
    const todaySnap = snapshots.find((s) => s.date === today);
    if (todaySnap) {
      setDailySnapshot(todaySnap);
      setIsTodayAvailable(true);
    }

    return () => clearInterval(timer);
  }, []);

  const update = (key, value) => {
    setInputs({ ...inputs, [key]: Number(value) });
    setAiVisible(false);
    setDailyDual(null);
  };

  const saveBriefing = (snapshot) => {
    const today = getTodayKey();
    const entry = { ...snapshot, date: today, cycleDay };
    const existing = JSON.parse(localStorage.getItem("monthlyBriefings")) || [];
    if (!existing.find((b) => b.date === today)) {
      existing.push(entry);
      localStorage.setItem("monthlyBriefings", JSON.stringify(existing));
    }
  };
  /* ================= AI RUNNERS ================= */
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
          previousSignals: "",
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
        saveBriefing(json.snapshot);
      }
    } catch (err) {
      console.error("AI Briefing failed", err);
    }
    setLoading(false);
  };

  const runAIDual = async () => {
    if (dailyPending) {
      alert("Today's signal is still forming. Please wait until it unlocks.");
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
          previousSignals: "",
          weeklyFocus: weeklyFocus?.key,
          ...inputs,
        }),
      });

      const data = await res.json();
      if (data?.snapshot) {
        saveMonthlySnapshot(data.snapshot);
        setDailySnapshot(data.snapshot);
        setIsTodayAvailable(true);
        setViewMode("executive");
        setAiVisible(true);
        setAiCollapsed(false);
      }
    } catch (err) {
      console.error("Snapshot save failed", err);
    }
    setLoading(false);
  };

  /* ================= ACTIVE CONTENT RESOLUTION ================= */
  const activeSnapshot = selectedDay
    ? getSnapshotByDay(selectedDay)
    : dailySnapshot;

  const activeDual = activeSnapshot || dailyDual;

  const activeText =
    activeDual &&
    (viewMode === "executive"
      ? activeDual.executive
      : activeDual.directive);

   /* ================= EXPORT & PERSISTENCE LOGIC ================= */
  const getBriefings = (range) => {
    const legacy = JSON.parse(localStorage.getItem("monthlyBriefings")) || [];
    const snapshots = getMonthlySnapshots() || [];
    
    const combined = [...legacy];
    snapshots.forEach(s => {
      if (!combined.find(b => b.date === s.date)) {
        combined.push(s);
      }
    });

    if (range === "day") {
      const today = getTodayKey();
      return combined.filter(b => b.date === today);
    }
    if (range === "week") return combined.slice(-7);
    if (range === "month") return combined;
    return [];
  };

  const handleDownload = () => {
    const data = getBriefings(exportRange);
    if (!data.length) return alert("No saved data available for this range.");

    const text = data
      .map(
        b =>
          `Day ${b.cycleDay} · ${b.date}\n\n${
            viewMode === "executive" ? b.executive : b.directive
          }`
      )
      .join("\n\n---------------------\n\n");

    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `WealthyAI_${exportRange}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    if (!activeText) return;
    try {
      const res = await fetch("/api/export-month-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: activeText, cycleDay, region }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wealthyai-briefing-day${cycleDay}.pdf`;
      a.click();
    } catch (err) {
      console.error("PDF export failed", err);
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
      alert("Briefing sent to your registered email.");
    } catch (err) {
      console.error("Email failed", err);
    }
    setEmailSending(false);
  };
  /* ================= RENDER LOGIC ================= */
  return (
    <div
      style={{
        ...page,
        overflowX: isMobile ? "hidden" : undefined,
        backgroundAttachment: "fixed",
      }}
    >
      <style>{`
        .ticker-container {
          width: 100%;
          overflow: hidden;
          background: transparent;
          padding: 5px 0;
          margin-bottom: 15px;
        }
        .ticker-text {
          display: inline-block;
          white-space: nowrap;
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(255, 255, 255, 0.4);
          animation: marquee 25s linear infinite;
        }
        .ticker-text span { margin-right: 50px; }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="ticker-container">
        <div className="ticker-text">
          <span>Wealthy AI: We don’t advise, we interpret</span>
          <span>Clearer thinking, not just faster decisions</span>
          <span>Rewarding attention over speed</span>
          <span>Supporting your judgment, quietly</span>
          <span>Wealthy AI: We don’t advise, we interpret</span>
          <span>Clearer thinking, not just faster decisions</span>
        </div>
      </div>

      <a href="/month/help" style={helpButton}>Help</a>

      <div style={header}>
        <h1 style={title}>WEALTHYAI · MONTHLY BRIEFING</h1>
        <p style={subtitle}>Strategic financial outlook · Next 90 days</p>
      </div>

      <div style={regionRow}>
        <span style={regionLabel}>Region</span>
        <select
          value={region}
          onChange={e => setRegion(e.target.value)}
          style={regionSelect}
        >
          {REGIONS.map(r => (
            <option key={r.code} value={r.code}>{r.label}</option>
          ))}
        </select>
      </div>

      <div style={signalBox}>
        <strong>Cycle Status</strong>
        <p>Day {cycleDay} of your current monthly cycle.</p>
      </div>

      <div style={signalBox}>
        <strong>Today’s Signal</strong>
        {dailyPending ? (
          <p style={{ opacity: 0.7 }}>Today’s signal is still forming...</p>
        ) : (
          <p>{dailySignal}</p>
        )}
      </div>

      <div style={signalBox}>
        <strong>Weekly focus</strong>
        <p style={{ opacity: 0.75 }}>
          {weeklyFocus 
            ? `Current focus: ${weeklyFocus.key.toUpperCase()}` 
            : "Choose one focus area for this week. This affects how your data is interpreted."}
        </p>

        <button onClick={() => setFocusOpen(!focusOpen)} style={exportBtn}>
          {focusOpen ? "Close selection" : (weeklyFocus ? "Change selection" : "What is this?")}
        </button>

        {focusOpen && (
          <div style={{ marginTop: 12 }}>
            {FOCUS_OPTIONS.map((f, i) => {
              const isSelected = weeklyFocus?.key === f.key;
              const hasSelection = !!weeklyFocus;
              const disabled = i < getCurrentWeekIndex();

              return (
                <button
                  key={f.key}
                  disabled={disabled || (hasSelection && !isSelected)}
                  onClick={() => setFocusPreview(f.key)}
                  style={{
                    ...exportBtn,
                    opacity: (disabled || (hasSelection && !isSelected)) ? 0.3 : 1,
                    cursor: (disabled || (hasSelection && !isSelected)) ? "not-allowed" : "pointer",
                    background: (focusPreview === f.key || isSelected) ? "#38bdf8" : "transparent",
                    color: (focusPreview === f.key || isSelected) ? "#020617" : "#38bdf8",
                    marginBottom: 6,
                    display: "block",
                    width: "100%"
                  }}
                >
                  {f.label} {isSelected ? "✓" : ""}
                </button>
              );
            })}

            {focusPreview && !weeklyFocus && (
              <div style={{ marginTop: 10 }}>
                <p style={{ fontSize: 13, opacity: 0.7 }}>
                  You selected <strong>{focusPreview}</strong> for this week.
                  This cannot be changed later.
                </p>
                <button onClick={confirmWeeklyFocus} style={aiButton}>
                  Confirm focus
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          ...layout,
          gridTemplateColumns: isMobile ? "1fr" : layout.gridTemplateColumns,
          gap: isMobile ? 20 : layout.gap,
        }}
      >
        {/* LEFT COLUMN: INPUTS & SIMULATION */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            height: aiBoxHeight,
            justifyContent: 'space-between'
          }}
        >
          <div style={card}>
            <h3>Monthly Financial Structure</h3>
            <Label>Income</Label>
            <Input value={inputs.income} onChange={e => update("income", e.target.value)} />
            
            <Section title="Living">
              <Row label="Housing" value={inputs.housing} onChange={v => update("housing", v)} />
              <Row label="Unexpected" value={inputs.unexpected} onChange={v => update("unexpected", v)} />
            </Section>

            <Section title="Utilities">
              <Row label="Electricity" value={inputs.electricity} onChange={v => update("electricity", v)} />
              <Row label="Gas" value={inputs.gas} onChange={v => update("gas", v)} />
              <Row label="Water" value={inputs.water} onChange={v => update("water", v)} />
            </Section>

            <Section title="Recurring Services">
              <Row label="Internet" value={inputs.internet} onChange={v => update("internet", v)} />
              <Row label="Mobile phone" value={inputs.mobile} onChange={v => update("mobile", v)} />
              <Row label="TV / Streaming" value={inputs.tv} onChange={v => update("tv", v)} />
              <Row label="Insurance" value={inputs.insurance} onChange={v => update("insurance", v)} />
              <Row label="Banking fees" value={inputs.banking} onChange={v => update("banking", v)} />
              <Row label="Other" value={inputs.other} onChange={v => update("other", v)} />
            </Section>

            <Divider />
            
            <div style={{ padding: "10px 0" }}>
              <strong style={{ color: "#10b981", fontSize: 13, display: "block", marginBottom: 10 }}>
                STRUCTURAL STRESS TEST
              </strong>
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={stressFactor}
                onChange={(e) => {
                  setStressFactor(parseFloat(e.target.value));
                  setSimulationActive(true);
                  setAiVisible(false);
                }}
                style={{ width: "100%", accentColor: "#10b981", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, opacity: 0.5, marginTop: 4 }}>
                <span>BASE</span>
                <span>CRISIS (+100%)</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
              <button 
                onClick={() => { setSimulationActive(true); setAiVisible(false); }}
                style={{ ...exportBtn, borderColor: "#10b981", color: "#10b981" }}
              >
                SIMULATE
              </button>
              <button onClick={runAI} style={{ ...aiButton, marginTop: 0 }}>
                {loading ? "Generating..." : "GENERATE AI"}
              </button>
            </div>

            <button
              onClick={runAIDual}
              style={{ ...exportBtn, marginTop: 12, width: "100%" }}
            >
              Save Today’s Snapshot
            </button>
          </div>

          {/* SPIDERNET CONTAINER - DINAMIKUS MAGASSÁG */}
        {aiVisible && !isMobile && (
          <div style={{ 
            borderRadius: 16, 
            overflow: 'hidden',
            background: "rgba(2,6,23,0.4)",
            transition: "all 0.3s ease"
          }}>
            <SpiderNet isMobile={isMobile} height={aiBoxHeight} />
          </div>
        )}

        </div>

        {/* RIGHT COLUMN: AI OUTPUT & ARCHIVE */}
        <div style={card} ref={aiBoxRef}>
          {!aiVisible && !simulationActive && (
            <div style={{ padding: "10px", animation: "fadeIn 0.8s ease-in" }}>
              <strong style={{ color: "#10b981", fontSize: 12, letterSpacing: 1 }}>WEALTHYAI PHILOSOPHY</strong>
              <h2 style={{ fontSize: 22, marginTop: 10 }}>Interpretation, Not Advice.</h2>
              <p style={{ opacity: 0.7, lineHeight: "1.6", fontSize: 14 }}>
                We built WealthyAI around a different question: What happens if AI doesn’t advise — but interprets?
                Not faster decisions, but <strong>clearer thinking</strong>.
              </p>
              <p style={{ opacity: 0.7, lineHeight: "1.6", fontSize: 14, marginTop: 12 }}>
                Our system assumes that you remain responsible for decisions — it simply gives you a clearer frame to make them. 
                WealthyAI doesn’t reward speed. It rewards <strong>attention</strong>.
              </p>
            </div>
          )}

          {simulationActive && !aiVisible && (
            <div style={{ padding: "10px", animation: "fadeIn 0.3s ease-out" }}>
              <strong style={{ color: "#10b981", fontSize: 12 }}>LIVE SIMULATION ENGINE</strong>
              <h2 style={{ fontSize: 20, marginTop: 5 }}>Structural Fragility Index</h2>
              <div style={{ fontSize: 42, fontWeight: "bold", color: "#38bdf8", margin: "15px 0" }}>
                {calculateFragility()}%
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ 
                  height: "100%", 
                  width: `${calculateFragility()}%`, 
                  background: "linear-gradient(90deg, #10b981, #38bdf8)",
                  transition: "width 0.3s ease" 
                }} />
              </div>
              <p style={{ opacity: 0.6, fontSize: 13, marginTop: 15, lineHeight: "1.5" }}>
                At <strong>{Math.round(stressFactor * 100)}%</strong> simulated pressure, your core financial rigidity is 
                {parseFloat(calculateFragility()) > 55 ? " approaching a critical threshold." : " currently within structural limits."}
              </p>
              <button onClick={() => setSimulationActive(false)} style={{ ...exportBtn, marginTop: 20, fontSize: 12, opacity: 0.6 }}>Reset view</button>
            </div>
          )}

          {aiVisible && (
            <div style={{ animation: "fadeIn 0.4s ease-out" }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <button
                  onClick={() => setViewMode("executive")}
                  style={{
                    ...exportBtn,
                    background: viewMode === "executive" ? "#38bdf8" : "transparent",
                    color: viewMode === "executive" ? "#020617" : "#38bdf8",
                  }}
                >
                  Executive
                </button>
                <button
                  onClick={() => setViewMode("directive")}
                  style={{
                    ...exportBtn,
                    background: viewMode === "directive" ? "#38bdf8" : "transparent",
                    color: viewMode === "directive" ? "#020617" : "#38bdf8",
                  }}
                >
                  Directive
                </button>
                <button onClick={() => { setAiVisible(false); setSimulationActive(false); }} style={{ ...exportBtn, maxWidth: 44 }}>✕</button>
              </div>

              <pre style={aiTextStyle}>{activeText}</pre>

              {!selectedDay && (
                <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: isMobile ? "wrap" : "nowrap" }}>
                  <select value={exportRange} onChange={e => setExportRange(e.target.value)} style={exportSelect}>
                    <option value="day">Today</option>
                    <option value="week">Last 7 days</option>
                    <option value="month">This month</option>
                  </select>
                  <button onClick={handleDownload} style={exportBtn}>Download</button>
                  <button onClick={downloadPDF} style={exportBtn}>PDF</button>
                  <button onClick={sendEmailPDF} style={exportBtn}>{emailSending ? "..." : "Email"}</button>
                </div>
              )}
            </div>
          )}

          <Divider />
          
          <button onClick={() => setArchiveOpen(!archiveOpen)} style={{ ...exportBtn, width: "100%" }}>
            {archiveOpen ? "Hide past days" : "View past days"}
          </button>
          
          {archiveOpen && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
              {getMonthlySnapshots().map(s => (
                <button
                  key={s.date}
                  onClick={() => { setSelectedDay(s.cycleDay); setAiVisible(true); setSimulationActive(false); }}
                  style={{ 
                    ...exportBtn, 
                    textAlign: "left",
                    background: selectedDay === s.cycleDay ? "rgba(56,189,248,0.1)" : "transparent"
                  }}
                >
                  Day {s.cycleDay} — {s.date}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={footer}>© 2026 WealthyAI · Monthly Intelligence</div>
    </div>
  );
}

/* ================= HELPER COMPONENTS & STYLES ================= */
const Section = ({ title, children }) => (
  <>
    <Divider />
    <strong style={{fontSize: 14, color: "#7dd3fc", display: "block", marginBottom: 8}}>{title}</strong>
    {children}
  </>
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

/* STYLES OBJECTS */
const page = {
  minHeight: "100vh", position: "relative", padding: "40px 20px", color: "#e5e7eb", fontFamily: "Inter, system-ui", backgroundColor: "#020617",
  backgroundImage: `repeating-linear-gradient(-25deg, rgba(56,189,248,0.04) 0px, rgba(56,189,248,0.04) 1px, transparent 1px, transparent 180px), repeating-linear-gradient(35deg, rgba(167,139,250,0.04) 0px, rgba(167,139,250,0.04) 1px, transparent 1px, transparent 260px), radial-gradient(circle at 20% 30%, rgba(56,189,248,0.14), transparent 45%), radial-gradient(circle at 80% 60%, rgba(167,139,250,0.14), transparent 50%), url("/wealthyai/icons/generated.png")`,
  backgroundRepeat: "repeat, repeat, no-repeat, no-repeat, repeat", backgroundSize: "auto, auto, 100% 100%, 100% 100%, 420px auto",
};

const header = { textAlign: "center", marginBottom: 20 };
const title = { fontSize: "2rem", margin: 0, fontWeight: "800", letterSpacing: "-0.02em" };
const subtitle = { marginTop: 8, color: "#cbd5f5", fontSize: 14 };

const helpButton = { position: "absolute", top: 20, right: 20, padding: "6px 12px", borderRadius: 8, fontSize: 12, textDecoration: "none", color: "#7dd3fc", border: "1px solid #1e293b", background: "rgba(2,6,23,0.7)" };

const regionRow = { display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 };
const regionLabel = { color: "#7dd3fc", fontSize: 14, alignSelf: "center" };
const regionSelect = { background: "#020617", color: "#e5e7eb", border: "1px solid #1e293b", padding: "4px 8px", borderRadius: 6 };

const signalBox = { maxWidth: 800, margin: "0 auto 15px", padding: 14, border: "1px solid #1e293b", borderRadius: 12, background: "rgba(2,6,23,0.75)" };

const layout = { display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 25, maxWidth: 1100, margin: "0 auto" };
const card = { padding: 20, borderRadius: 16, border: "1px solid #1e293b", background: "rgba(2,6,23,0.78)", height: "fit-content" };

const input = { width: "100%", padding: 10, marginTop: 4, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, color: "white", outline: "none" };
const row = { display: "flex", justifyContent: "space-between", marginTop: 8 };
const rowInput = { width: 85, background: "transparent", border: "none", borderBottom: "1px solid #38bdf8", color: "#38bdf8", textAlign: "right", outline: "none" };

const aiButton = { marginTop: 20, width: "100%", padding: 12, background: "#38bdf8", border: "none", borderRadius: 10, fontWeight: "bold", cursor: "pointer", color: "#020617" };
const aiTextStyle = { marginTop: 10, whiteSpace: "pre-wrap", color: "#cbd5f5", fontSize: 14, lineHeight: "1.7", fontFamily: "Inter, sans-serif" };

const exportBtn = { padding: "8px 14px", borderRadius: 8, border: "1px solid #1e293b", background: "transparent", color: "#38bdf8", cursor: "pointer", fontSize: 13, transition: "all 0.2s" };
const exportSelect = { background: "transparent", color: "#e5e7eb", border: "1px solid #1e293b", padding: "8px", borderRadius: 8, outline: "none" };

const footer = { marginTop: 40, textAlign: "center", fontSize: 12, color: "#64748b", paddingBottom: 20 };
