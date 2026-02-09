import { useState, useEffect } from "react";
import Topography from "./Topography";
import {
  saveMonthlySnapshot,
  getMonthlySnapshots,
  getSnapshotByDay,
} from "../lib/monthlyArchive";

/* ================= DAILY SIGNAL UNLOCK LOGIC ================= */

const DAILY_SIGNAL_KEY = "dailySignalUnlock";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDailyUnlockTime() {
  const stored = JSON.parse(localStorage.getItem(DAILY_SIGNAL_KEY) || "{}");
  const today = getTodayKey();

  if (stored.date === today) return stored.unlockAt;

  // Random unlock between 07:00 and 16:59
  const hour = Math.floor(Math.random() * 10) + 7;
  const minute = Math.floor(Math.random() * 60);

  const unlockAt = new Date();
  unlockAt.setHours(hour, minute, 0, 0);

  localStorage.setItem(
    DAILY_SIGNAL_KEY,
    JSON.stringify({ date: today, unlockAt: unlockAt.getTime() })
  );

  return unlockAt.getTime();
}

/* ================= REGIONS & CONSTANTS ================= */

const REGIONS = [
  { code: "US", label: "United States" },
  { code: "EU", label: "European Union" },
  { code: "UK", label: "United Kingdom" },
  { code: "HU", label: "Hungary" },
  { code: "OTHER", label: "Other regions" },
];

export default function PremiumMonth() {
  // === MOBILE ADAPTATION ===
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= SIMULATION & STRESS STATE ================= */
  const [simulationActive, setSimulationActive] = useState(false);
  const [stressFactor, setStressFactor] = useState(0); // 0 to 1

  const calculateFragility = () => {
    const energy = (inputs.electricity + inputs.gas) * (1 + stressFactor);
    const fixed = 
      inputs.housing + 
      inputs.insurance + 
      inputs.banking + 
      inputs.internet + 
      inputs.mobile + 
      inputs.tv + 
      energy;
    const ratio = (fixed / inputs.income) * 100;
    return Math.min(Math.max(ratio, 0), 100).toFixed(1);
  };

  /* ================= ACCESS CHECK ================= */

  useEffect(() => {
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

  /* ================= REGION AUTO-DETECT ================= */

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
      } catch {
        /* silent fallback */
      }
    };
    detect();
    return () => { cancelled = true; };
  }, []);

  /* ================= CORE STATE ================= */

  const [viewMode, setViewMode] = useState("executive");
  const [cycleDay, setCycleDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  /* ================= AI PANEL STATE ================= */

  const [aiVisible, setAiVisible] = useState(false);
  const [aiCollapsed, setAiCollapsed] = useState(true);

  /* ================= DAILY SIGNAL ================= */

  const [dailySignal, setDailySignal] = useState(null);
  const [dailyPending, setDailyPending] = useState(true);

  /* ================= DAILY / SNAPSHOT AI ================= */

  const [dailyDual, setDailyDual] = useState(null);
  const [dailySnapshot, setDailySnapshot] = useState(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [exportRange, setExportRange] = useState("day");

  /* ================= SNAPSHOT AVAILABILITY ================= */

  const [isTodayAvailable, setIsTodayAvailable] = useState(false);

  /* ================= WEEKLY FOCUS ================= */

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

  const getCurrentWeekIndex = () => {
    return Math.floor((cycleDay - 1) / WEEK_LENGTH);
  };

  const FOCUS_OPTIONS = [
    { key: "stability", label: "Stability" },
    { key: "spending", label: "Spending behavior" },
    { key: "resilience", label: "Resilience" },
    { key: "direction", label: "Direction" },
  ];

  const confirmWeeklyFocus = () => {
    if (!focusPreview) return;
    const focus = {
      key: focusPreview,
      weekIndex: getCurrentWeekIndex(),
      setAt: Date.now(),
    };
    setWeeklyFocus(focus);
    localStorage.setItem("weeklyFocus", JSON.stringify(focus));
    setFocusPreview(null);
  };

  /* ================= INPUTS ================= */

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
    setInputs({ ...inputs, [key]: Number(value) });
    setAiVisible(false);
    setAiCollapsed(true);
    setDailyDual(null);
    setDailySnapshot(null);
    setSelectedDay(null);
  };

  /* ================= CYCLE LOGIC ================= */

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

  /* ================= SNAPSHOT AVAILABILITY EFFECT ================= */

  useEffect(() => {
    const today = getTodayKey();
    const key = `dailyAvailableAt_${today}`;
    let availableAt = localStorage.getItem(key);

    if (!availableAt) {
      const randomOffsetMs = Math.floor(Math.random() * 6 * 60 * 60 * 1000);
      const base = new Date();
      base.setHours(7, 0, 0, 0);
      availableAt = base.getTime() + randomOffsetMs;
      localStorage.setItem(key, availableAt.toString());
    }

    const check = () => {
      if (Date.now() >= Number(availableAt)) {
        setIsTodayAvailable(true);
      }
    };
    check();
    const i = setInterval(check, 60000);
    return () => clearInterval(i);
  }, [cycleDay]);

  /* ================= DAILY SIGNAL EFFECT ================= */

  useEffect(() => {
    const unlockAt = getDailyUnlockTime();
    const check = async () => {
      if (Date.now() < unlockAt) return;
      const seenKey = "dailySignalSeen_" + getTodayKey();
      const cached = localStorage.getItem(seenKey);

      if (cached) {
        setDailySignal(cached);
        setDailyPending(false);
        return;
      }

      const r = await fetch("/api/get-daily-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, country, cycleDay }),
      });

      const j = await r.json();
      if (j?.signal) {
        localStorage.setItem(seenKey, j.signal);
        setDailySignal(j.signal);
      }
      setDailyPending(false);
    };
    const t = setInterval(check, 30000);
    check();
    return () => clearInterval(t);
  }, [region, country, cycleDay]);

  /* ================= LEGACY STORAGE ================= */

  const saveBriefing = (dual) => {
    const today = getTodayKey();
    const stored = JSON.parse(localStorage.getItem("monthlyBriefings")) || [];
    if (!stored.find(b => b.date === today)) {
      stored.push({
        id: Date.now(),
        date: today,
        cycleDay,
        executive: dual.executive,
        directive: dual.directive,
      });
      localStorage.setItem("monthlyBriefings", JSON.stringify(stored.slice(-30)));
    }
  };

  /* ================= RUN AI ================= */

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
      console.error("AI Error:", err);
    }
    setLoading(false);
  };
  /* ================= SNAPSHOT AI ================= */

  const runAIDual = async () => {
    if (!isTodayAvailable) {
      alert("Today's snapshot is not available yet.");
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
        setViewMode("executive");
        setAiVisible(true);
        setAiCollapsed(false);
      }
    } catch (err) {
      console.error("Snapshot AI Error:", err);
    }

    setLoading(false);
  };

  /* ================= ACTIVE CONTENT LOGIC ================= */

  const activeSnapshot = selectedDay
    ? getSnapshotByDay(selectedDay)
    : dailySnapshot;

  const activeDual = activeSnapshot || dailyDual;

  const activeText =
    activeDual &&
    (viewMode === "executive"
      ? activeDual.executive
      : activeDual.directive);

  /* ================= EXPORT & DOWNLOAD LOGIC ================= */

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
    const res = await fetch("/api/export-month-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: activeText, cycleDay, region }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wealthyai-briefing-day-${cycleDay}.pdf`;
    a.click();
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
      alert("Email sent successfully.");
    } catch (err) {
      alert("Error sending email.");
    }
    setEmailSending(false);
  };

  /* ================= RENDER START ================= */

  return (
    <div
      style={{
        ...pageStyle,
        overflowX: "hidden",
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      {/* TICKER - ÁTLÁTSZÓ HÁTTÉR, TISZTA FEHÉR SZÖVEG */}
      <div style={tickerContainer}>
        <div style={tickerWrapper}>
          <div style={tickerTrack}>
            <span style={tickerText}>SYSTEM STATUS: OPERATIONAL · REGIONAL DATA SYNC: COMPLETE · AI INTERPRETATION ENGINE: ACTIVE · STRUCTURAL ANALYSIS: LIVE · </span>
            <span style={tickerText}>SYSTEM STATUS: OPERATIONAL · REGIONAL DATA SYNC: COMPLETE · AI INTERPRETATION ENGINE: ACTIVE · STRUCTURAL ANALYSIS: LIVE · </span>
          </div>
        </div>
      </div>

      <a href="/month/help" style={helpButton}>Help</a>

      <div style={header}>
        <h1 style={title}>WEALTHYAI · MONTHLY BRIEFING</h1>
        <p style={subtitle}>Strategic financial outlook · Next 90 days</p>
      </div>

      {/* REGION SELECTION */}
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

      {/* STATUS BOXES */}
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

      {/* WEEKLY FOCUS UI */}
      <div style={signalBox}>
        <strong>Weekly focus</strong>
        <p style={{ opacity: 0.75, fontSize: 13, marginTop: 4 }}>
          {weeklyFocus 
            ? `Current focus: ${weeklyFocus.key.toUpperCase()}` 
            : "Choose one focus area for this week to guide AI interpretation."}
        </p>

        <button onClick={() => setFocusOpen(!focusOpen)} style={exportBtn}>
          {focusOpen ? "Close" : (weeklyFocus ? "Change selection" : "Select Focus")}
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
                    width: "100%",
                    textAlign: "left"
                  }}
                >
                  {f.label} {isSelected ? "✓" : ""}
                </button>
              );
            })}
            
            {focusPreview && !weeklyFocus && (
              <button onClick={confirmWeeklyFocus} style={{...aiButton, marginTop: 10}}>
                Confirm {focusPreview.toUpperCase()}
              </button>
            )}
          </div>
        )}
      </div>

      {/* MAIN GRID LAYOUT */}
      <div
        style={{
          ...layout,
          gridTemplateColumns: isMobile ? "1fr" : layout.gridTemplateColumns,
          gap: isMobile ? 20 : layout.gap,
          width: "100%",
          boxSizing: "border-box"
        }}
      >
        {/* LEFT COLUMN: ALL INPUTS */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={card}>
            <h3 style={{fontSize: 16, marginBottom: 15}}>Financial Structure</h3>
            
            <Label>Monthly Income</Label>
            <Input value={inputs.income} onChange={e => update("income", e.target.value)} />
            
            <Divider />

            <Section title="Fixed Living">
              <Row label="Housing / Rent" value={inputs.housing} onChange={v => update("housing", v)} />
              <Row label="Insurance" value={inputs.insurance} onChange={v => update("insurance", v)} />
              <Row label="Banking Fees" value={inputs.banking} onChange={v => update("banking", v)} />
            </Section>

            <Section title="Utilities & Energy">
              <Row label="Electricity" value={inputs.electricity} onChange={v => update("electricity", v)} />
              <Row label="Gas" value={inputs.gas} onChange={v => update("gas", v)} />
              <Row label="Water" value={inputs.water} onChange={v => update("water", v)} />
            </Section>

            <Section title="Digital & Services">
              <Row label="Internet" value={inputs.internet} onChange={v => update("internet", v)} />
              <Row label="Mobile Plan" value={inputs.mobile} onChange={v => update("mobile", v)} />
              <Row label="TV / Streaming" value={inputs.tv} onChange={v => update("tv", v)} />
            </Section>

            <Section title="Safety Buffer">
              <Row label="Unexpected" value={inputs.unexpected} onChange={v => update("unexpected", v)} />
              <Row label="Other" value={inputs.other} onChange={v => update("other", v)} />
            </Section>

            <Divider />

            {/* STRESS TEST SLIDER */}
            <div style={{ padding: "10px 0" }}>
              <strong style={{ color: "#10b981", fontSize: 13, display: "block", marginBottom: 10 }}>STRUCTURAL STRESS TEST</strong>
              <input 
                type="range" min="0" max="1" step="0.01" value={stressFactor}
                onChange={(e) => { setStressFactor(parseFloat(e.target.value)); setSimulationActive(true); }}
                style={{ width: "100%", accentColor: "#10b981", cursor: "pointer" }}
              />
              <div style={{display: "flex", justifyContent: "space-between", fontSize: 10, opacity: 0.5, marginTop: 5}}>
                <span>NORMAL</span>
                <span>CRISIS (+100%)</span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
              <button onClick={() => { setSimulationActive(true); setAiVisible(false); }} style={{ ...exportBtn, borderColor: "#10b981", color: "#10b981" }}>SIMULATE</button>
              <button onClick={runAI} style={{ ...aiButton, marginTop: 0 }}>{loading ? "PROCESSING..." : "GENERATE AI"}</button>
            </div>
            
            <button onClick={runAIDual} style={{ ...exportBtn, width: "100%", marginTop: 12 }}>
              {isTodayAvailable ? "Save Today's Snapshot" : "Snapshot Locked"}
            </button>
          </div>

          {/* DYNAMIC TOPOGRAPHY - MAX MAGASSÁG KORLÁTTAL ÉS BEZÁRULÁSSAL */}
          {aiVisible && (
            <div style={{ 
              marginTop: 25, 
              borderRadius: 16, 
              border: "1px solid #1e293b", 
              background: "rgba(2,6,23,0.4)", 
              overflow: "hidden", 
              position: "relative", 
              maxHeight: 300, 
              flexGrow: 0 
            }}>
                <Topography income={inputs.income} spawnNumbers={true} stressFactor={stressFactor} speed={1 + stressFactor * 2} />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI RESULTS & VISUALS */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ ...card, flexGrow: 1, minHeight: 500 }}>
            
            {!aiVisible && !simulationActive && (
              <div style={{ padding: "10px", height: "100%", display: "flex", flexDirection: "column" }}>
                <strong style={{ color: "#10b981", fontSize: 12 }}>SYSTEM STABILITY TOPOGRAPHY</strong>
                <div style={{ flexGrow: 1, minHeight: 300 }}>
                    <Topography income={inputs.income} spawnNumbers={false} stressFactor={stressFactor} speed={1 + stressFactor * 2} />
                </div>
                <h2 style={{fontSize: 22, marginTop: 20}}>Strategic Interpretation</h2>
                <p style={{opacity: 0.7, lineHeight: 1.6}}>Modify inputs or run simulation to see structural fragility. AI analysis will appear here after generation.</p>
              </div>
            )}

            {simulationActive && !aiVisible && (
              <div style={{ padding: "10px" }}>
                <strong style={{ color: "#10b981", fontSize: 12 }}>LIVE SIMULATION</strong>
                <h2 style={{fontSize: 32, margin: "10px 0"}}>{calculateFragility()}%</h2>
                <p style={{opacity: 0.6}}>Fragility Index at current stress levels.</p>
                <div style={{ height: 200, marginTop: 20, borderRadius: 12, overflow: "hidden" }}>
                  <Topography income={inputs.income} spawnNumbers={true} stressFactor={stressFactor} speed={2} />
                </div>
                <button onClick={() => setSimulationActive(false)} style={{...exportBtn, marginTop: 20}}>Reset View</button>
              </div>
            )}

            {aiVisible && (
              <div style={{animation: "fadeIn 0.5s ease"}}>
                <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                  <button onClick={() => setViewMode("executive")} style={{ ...exportBtn, background: viewMode === "executive" ? "#38bdf8" : "transparent", color: viewMode === "executive" ? "#020617" : "#38bdf8" }}>Executive</button>
                  <button onClick={() => setViewMode("directive")} style={{ ...exportBtn, background: viewMode === "directive" ? "#38bdf8" : "transparent", color: viewMode === "directive" ? "#020617" : "#38bdf8" }}>Directive</button>
                  <button onClick={() => { setAiVisible(false); setSimulationActive(false); }} style={{ ...exportBtn, marginLeft: "auto" }}>✕</button>
                </div>
                
                <pre style={aiTextStyle}>{activeText}</pre>

                {/* EXPORT TOOLS */}
                <div style={{ marginTop: 30, display: "flex", gap: 10, flexWrap: "wrap", borderTop: "1px solid #1e293b", paddingTop: 20 }}>
                   <select value={exportRange} onChange={e => setExportRange(e.target.value)} style={{...regionSelect, padding: 8}}>
                      <option value="day">Today</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                   </select>
                   <button onClick={handleDownload} style={exportBtn}>TXT</button>
                   <button onClick={downloadPDF} style={exportBtn}>PDF</button>
                   <button onClick={sendEmailPDF} style={exportBtn}>{emailSending ? "..." : "Email"}</button>
                </div>
              </div>
            )}

            {/* ARCHIVE TOGGLE */}
            <Divider />
            <button onClick={() => setArchiveOpen(!archiveOpen)} style={{ ...exportBtn, width: "100%" }}>
              {archiveOpen ? "Hide Archive" : "View Past Days"}
            </button>
            {archiveOpen && (
              <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                {getMonthlySnapshots().map(s => (
                  <button key={s.date} onClick={() => { setSelectedDay(s.cycleDay); setAiVisible(true); }} style={exportBtn}>
                    Day {s.cycleDay}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={footer}>© 2026 WealthyAI · Proprietary Financial Intelligence System</div>

      <style jsx global>{`
        @keyframes tickerMove { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

/* ================= COMPONENT HELPERS ================= */
const Section = ({ title, children }) => (
  <div style={{marginTop: 15}}>
    <strong style={{fontSize: 12, color: "#7dd3fc", letterSpacing: 0.5, textTransform: "uppercase"}}>{title}</strong>
    {children}
  </div>
);

const Row = ({ label, value, onChange }) => (
  <div style={rowStyle}>
    <span style={{fontSize: 13, opacity: 0.7}}>{label}</span>
    <input type="number" value={value} onChange={e => onChange(e.target.value)} style={rowInputStyle} />
  </div>
);

const Label = ({ children }) => (
  <label style={{ marginBottom: 6, display: "block", fontSize: 13, opacity: 0.8, fontWeight: "500" }}>{children}</label>
);

const Input = ({ value, onChange }) => (
  <input type="number" value={value} onChange={onChange} style={inputStyle} />
);

const Divider = () => (
  <div style={{ height: 1, background: "#1e293b", margin: "20px 0" }} />
);

/* ================= STYLES ================= */
const pageStyle = {
  minHeight: "100vh",
  padding: "80px 20px 60px",
  color: "#e5e7eb",
  fontFamily: "Inter, system-ui, sans-serif",
  backgroundColor: "#020617",
  backgroundImage: `
    repeating-linear-gradient(-25deg, rgba(56,189,248,0.04) 0px, rgba(56,189,248,0.04) 1px, transparent 1px, transparent 180px),
    repeating-linear-gradient(35deg, rgba(167,139,250,0.04) 0px, rgba(167,139,250,0.04) 1px, transparent 1px, transparent 260px),
    radial-gradient(circle at 20% 30%, rgba(56,189,248,0.12), transparent 45%),
    radial-gradient(circle at 80% 60%, rgba(167,139,250,0.12), transparent 50%)
  `,
  backgroundAttachment: "fixed",
};

const tickerContainer = { position: "fixed", top: 0, left: 0, width: "100%", height: 32, background: "transparent", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", zIndex: 1000, display: "flex", alignItems: "center", overflow: "hidden" };
const tickerWrapper = { width: "100%", overflow: "hidden" };
const tickerTrack = { display: "flex", whiteSpace: "nowrap", animation: "tickerMove 40s linear infinite" };
const tickerText = { color: "#ffffff", fontSize: 10, fontWeight: "600", letterSpacing: 1.5, paddingRight: 60 };

const header = { textAlign: "center", marginBottom: 40 };
const title = { fontSize: "2.2rem", fontWeight: "800", letterSpacing: "-0.02em", margin: 0 };
const subtitle = { marginTop: 10, color: "#94a3b8", fontSize: 15 };

const helpButton = { position: "absolute", top: 80, right: 20, padding: "8px 16px", borderRadius: 8, fontSize: 12, textDecoration: "none", color: "#7dd3fc", border: "1px solid #1e293b", background: "rgba(2,6,23,0.6)" };
const regionRow = { display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 30 };
const regionLabel = { color: "#7dd3fc", fontSize: 14, fontWeight: "600" };
const regionSelect = { background: "#0f172a", color: "#f8fafc", border: "1px solid #1e293b", padding: "6px 12px", borderRadius: 8, outline: "none" };

const signalBox = { maxWidth: 800, margin: "0 auto 15px", padding: 18, border: "1px solid #1e293b", borderRadius: 14, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(10px)" };
const layout = { display: "grid", gridTemplateColumns: "400px 1fr", gap: 30, maxWidth: 1200, margin: "0 auto" };
const card = { padding: 24, borderRadius: 20, border: "1px solid #1e293b", background: "rgba(15,23,42,0.7)", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" };

const inputStyle = { width: "100%", padding: "12px", background: "rgba(2,6,23,0.5)", border: "1px solid #1e293b", borderRadius: 10, color: "#fff", fontSize: 15, transition: "border 0.2s" };
const rowStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 };
const rowInputStyle = { width: 90, background: "transparent", border: "none", borderBottom: "1px solid #334155", color: "#38bdf8", textAlign: "right", padding: "4px", fontSize: 14, outline: "none" };

const aiButton = { width: "100%", padding: "14px", background: "#38bdf8", border: "none", borderRadius: 12, fontWeight: "800", cursor: "pointer", color: "#020617", fontSize: 14, letterSpacing: 0.5, textTransform: "uppercase" };
const aiTextStyle = { marginTop: 10, whiteSpace: "pre-wrap", color: "#cbd5f5", fontSize: 15, lineHeight: "1.7", fontFamily: "inherit" };
const exportBtn = { padding: "10px 16px", borderRadius: 10, border: "1px solid #1e293b", background: "transparent", color: "#38bdf8", cursor: "pointer", fontSize: 13, fontWeight: "600" };
const footer = { marginTop: 80, textAlign: "center", fontSize: 12, color: "#475569", paddingBottom: 40 };
