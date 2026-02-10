import { useState, useEffect } from "react";
import {
  saveMonthlySnapshot,
  getMonthlySnapshots,
  getSnapshotByDay,
} from "../lib/monthlyArchive";
import Topography from "./Topography";

/* ================= DAILY SIGNAL UNLOCK ================= */
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

/* ================= REGIONS ================= */
const REGIONS = [
  { code: "US", label: "United States" },
  { code: "EU", label: "European Union" },
  { code: "UK", label: "United Kingdom" },
  { code: "HU", label: "Hungary" },
  { code: "OTHER", label: "Other regions" },
];

/* ===== TICKER COMPONENT ===== */
const WealthyTicker = ({ isMobile }) => {
  const tickerText = "WealthyAI interprets your financial state over time — not advice, not prediction, just clarity • Interpretation over advice • Clarity over certainty • Insight unfolds over time • Financial understanding isn’t instant • Context changes • Insight follows time • Clarity over certainty • Built on time, not urgency • ";
  return (
    <div style={{ position: "absolute", top: 10, left: 0, width: "100%", height: 20, overflow: "hidden", zIndex: 20, pointerEvents: "none", background: "rgba(2,6,23,0.4)", display: "flex", alignItems: "center" }}>
      <style>{`@keyframes waiTickerScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      <div style={{ display: "inline-block", whiteSpace: "nowrap", fontSize: 10, fontWeight: "500", letterSpacing: "0.05em", color: "rgba(255,255,255,0.85)", animation: "waiTickerScroll 40s linear infinite", paddingLeft: "100%" }}>
        <span>{tickerText}</span><span>{tickerText}</span>
      </div>
    </div>
  );
};

export default function PremiumMonth() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const [simulationActive, setSimulationActive] = useState(false);
  const [stressFactor, setStressFactor] = useState(0);

  const [inputs, setInputs] = useState({
    income: 4000, housing: 1200, electricity: 120, gas: 90, water: 40,
    internet: 60, mobile: 40, tv: 30, insurance: 150, banking: 20,
    unexpected: 200, other: 300,
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
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
        const j = await r.json();
        if (!cancelled && j?.region) setRegion(j.region);
        if (!cancelled && j?.country) setCountry(j.country);
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

  const confirmWeeklyFocus = () => {
    const focus = { key: focusPreview, weekIndex: Math.floor((cycleDay - 1) / 7), setAt: Date.now() };
    setWeeklyFocus(focus);
    localStorage.setItem("weeklyFocus", JSON.stringify(focus));
    setFocusPreview(null);
  };

  const update = (key, value) => {
    setInputs({ ...inputs, [key]: Number(value) });
    setAiVisible(false);
    setDailyDual(null);
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
    const unlockAt = getDailyUnlockTime();
    const check = async () => {
      if (Date.now() < unlockAt) return;
      const seenKey = "dailySignalSeen_" + getTodayKey();
      const cached = localStorage.getItem(seenKey);
      if (cached) { setDailySignal(cached); setDailyPending(false); return; }
      const r = await fetch("/api/get-daily-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, country, cycleDay }),
      });
      const j = await r.json();
      if (j?.signal) { localStorage.setItem(seenKey, j.signal); setDailySignal(j.signal); }
      setDailyPending(false);
    };
    check();
  }, [region, country, cycleDay]);

  const runAI = async () => {
    setLoading(true); setSimulationActive(false);
    try {
      const res = await fetch("/api/get-ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, country, cycleDay, weeklyFocus: weeklyFocus?.key, ...inputs }),
      });
      const json = await res.json();
      if (json?.snapshot) {
        setDailyDual(json.snapshot);
        setAiVisible(true);
        const stored = JSON.parse(localStorage.getItem("monthlyBriefings")) || [];
        stored.push({ id: Date.now(), date: getTodayKey(), cycleDay, ...json.snapshot });
        localStorage.setItem("monthlyBriefings", JSON.stringify(stored.slice(-30)));
      }
    } catch {}
    setLoading(false);
  };
  /* ================= SNAPSHOT AI ================= */

  const runAIDual = async () => {
    const today = getTodayKey();
    const key = `dailyAvailableAt_${today}`;
    let availableAt = localStorage.getItem(key);
    if (!availableAt) {
      const randomOffsetMs = Math.floor(Math.random() * 6 * 60 * 60 * 1000);
      const base = new Date(); base.setHours(7, 0, 0, 0);
      availableAt = base.getTime() + randomOffsetMs;
      localStorage.setItem(key, availableAt.toString());
    }
    if (Date.now() < Number(availableAt)) {
      alert("Today's snapshot is not available yet."); return;
    }

    setLoading(true); setSimulationActive(false);
    try {
      const res = await fetch("/api/get-ai-briefing", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, country, cycleDay, weeklyFocus: weeklyFocus?.key, ...inputs }),
      });
      const data = await res.json();
      if (data?.snapshot) {
        saveMonthlySnapshot(data.snapshot);
        setDailySnapshot(data.snapshot);
        setAiVisible(true);
      }
    } catch {}
    setLoading(false);
  };

  /* ================= ACTIVE CONTENT ================= */

  const activeSnapshot = selectedDay ? getSnapshotByDay(selectedDay) : dailySnapshot;
  const activeDual = activeSnapshot || dailyDual;
  const activeText = activeDual && (viewMode === "executive" ? activeDual.executive : activeDual.directive);

  const handleDownload = () => {
    const legacy = JSON.parse(localStorage.getItem("monthlyBriefings")) || [];
    const snapshots = getMonthlySnapshots() || [];
    let combined = [...legacy];
    snapshots.forEach(s => { if (!combined.find(b => b.date === s.date)) combined.push(s); });
    
    const data = exportRange === "day" ? combined.filter(b => b.date === getTodayKey()) : (exportRange === "week" ? combined.slice(-7) : combined);
    if (!data.length) return alert("No data.");

    const text = data.map(b => `Day ${b.cycleDay} · ${b.date}\n\n${viewMode === "executive" ? b.executive : b.directive}`).join("\n\n---\n\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a"); a.href = url; a.download = `WealthyAI.txt`; a.click();
  };

  /* ================= RENDER ================= */

  return (
    <div style={page}>
      <WealthyTicker isMobile={isMobile} />
      <a href="/month/help" style={helpButton}>Help</a>

      <div style={header}>
        <h1 style={title}>WEALTHYAI · MONTHLY BRIEFING</h1>
        <p style={subtitle}>Strategic financial outlook · Next 90 days</p>
      </div>

      <div style={regionRow}>
        <span style={regionLabel}>Region</span>
        <select value={region} onChange={e => setRegion(e.target.value)} style={regionSelect}>
          {REGIONS.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
        </select>
      </div>

      <div style={signalBox}>
        <strong>Cycle Status: Day {cycleDay}</strong>
      </div>

      <div style={signalBox}>
        <strong>Today’s Signal</strong>
        <p>{dailyPending ? "Signal forming..." : dailySignal}</p>
      </div>

      <div style={signalBox}>
        <strong>Weekly focus: {weeklyFocus ? weeklyFocus.key.toUpperCase() : "None"}</strong>
        <button onClick={() => setFocusOpen(!focusOpen)} style={{...exportBtn, marginLeft: 10}}>Change</button>
        {focusOpen && (
          <div style={{ marginTop: 12 }}>
            {FOCUS_OPTIONS.map(f => (
              <button key={f.key} onClick={() => setFocusPreview(f.key)} style={{...exportBtn, display: "block", width: "100%", marginBottom: 4, background: focusPreview === f.key ? "#38bdf8" : "transparent"}}>
                {f.label}
              </button>
            ))}
            {focusPreview && <button onClick={confirmWeeklyFocus} style={aiButton}>Confirm</button>}
          </div>
        )}
      </div>

      <div style={{...layout, gridTemplateColumns: isMobile ? "1fr" : "1fr 1.3fr"}}>
        {/* LEFT: INPUTS */}
        <div style={card}>
          <h3>Financial Structure</h3>
          <Label>Income</Label><Input value={inputs.income} onChange={e => update("income", e.target.value)} />
          <Divider />
          <Section title="Living"><Row label="Housing" value={inputs.housing} onChange={v => update("housing", v)} /></Section>
          <Section title="Utilities">
            <Row label="Electricity" value={inputs.electricity} onChange={v => update("electricity", v)} />
            <Row label="Gas" value={inputs.gas} onChange={v => update("gas", v)} />
          </Section>
          <Divider />
          <strong>STRUCTURAL STRESS TEST</strong>
          <input type="range" min="0" max="1" step="0.01" value={stressFactor} onChange={e => {setStressFactor(parseFloat(e.target.value)); setSimulationActive(true); setAiVisible(false);}} style={{width:"100%", accentColor:"#10b981", marginTop: 10}} />
          
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:20}}>
            <button onClick={() => {setSimulationActive(true); setAiVisible(false);}} style={{...exportBtn, color:"#10b981"}}>SIMULATE</button>
            <button onClick={runAI} style={aiButton}>{loading ? "..." : "GENERATE AI"}</button>
          </div>
          <button onClick={runAIDual} style={{...exportBtn, width:"100%", marginTop:10}}>Save Snapshot</button>
        </div>

        {/* RIGHT: INTELLIGENCE & VISUALS */}
        <div style={{...card, position:"relative", display:"flex", flexDirection:"column", minHeight: 500}}>
          
          {/* TARTALOM RÉTEG */}
          <div style={{position:"relative", zIndex: 10, flex: 1}}>
            {aiVisible ? (
              <div style={{background:"rgba(2,6,23,0.85)", padding:20, borderRadius:12}}>
                <div style={{display:"flex", gap:10, marginBottom:15}}>
                  <button onClick={() => setViewMode("executive")} style={exportBtn}>Executive</button>
                  <button onClick={() => setViewMode("directive")} style={exportBtn}>Directive</button>
                  <button onClick={() => setAiVisible(false)} style={exportBtn}>✕</button>
                </div>
                <pre style={aiTextStyle}>{activeText}</pre>
                <div style={{marginTop:20, display:"flex", gap:10}}>
                  <button onClick={handleDownload} style={exportBtn}>Download TXT</button>
                </div>
              </div>
            ) : (
              <div style={{padding:10}}>
                <strong style={{color:"#10b981"}}>WEALTHYAI PHILOSOPHY</strong>
                <h2>Interpretation, Not Advice.</h2>
                <p style={{opacity:0.7, fontSize:14, lineHeight:"1.6"}}>
                  Our system assumes that you remain responsible for decisions — it simply gives you a clearer frame to make them. 
                  WealthyAI doesn’t reward speed. It rewards <strong>attention</strong>.
                </p>
                {simulationActive && (
                  <div style={{marginTop:20, background:"rgba(56,189,248,0.1)", padding:15, borderRadius:10}}>
                    <strong style={{fontSize:12}}>FRAGILITY INDEX: {calculateFragility()}%</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GRAFIKON RÉTEG (Boxon belül, alul) */}
          <div style={{
            position: "absolute", 
            bottom: 0, 
            left: 0, 
            width: "100%", 
            height: "50%", 
            pointerEvents: "none",
            zIndex: 1
          }}>
            <Topography 
              stressFactor={stressFactor} 
              income={inputs.income} 
              spawnNumbers={simulationActive} 
              isAiOpen={aiVisible} 
            />
          </div>
        </div>
      </div>

      <div style={footer}>© 2026 WealthyAI · Monthly Intelligence</div>
    </div>
  );
}

/* ================= STYLES (ORIGINAL BACKROUND RESTORED) ================= */
const Section = ({ title, children }) => (<><Divider /><strong>{title}</strong>{children}</>);
const Row = ({ label, value, onChange }) => (<div style={row}><span>{label}</span><input type="number" value={value} onChange={e => onChange(e.target.value)} style={rowInput} /></div>);
const Label = ({ children }) => (<label style={{display:"block", fontSize:13, opacity:0.8}}>{children}</label>);
const Input = ({ value, onChange }) => (<input type="number" value={value} onChange={onChange} style={input} />);
const Divider = () => (<div style={{ height: 1, background: "#1e293b", margin: "16px 0" }} />);

const page = {
  minHeight: "100vh", position: "relative", padding: "40px 20px", color: "#e5e7eb", fontFamily: "Inter, sans-serif",
  backgroundColor: "#020617",
  backgroundImage: `
    repeating-linear-gradient(-25deg, rgba(56,189,248,0.04) 0px, rgba(56,189,248,0.04) 1px, transparent 1px, transparent 180px),
    repeating-linear-gradient(35deg, rgba(167,139,250,0.04) 0px, rgba(167,139,250,0.04) 1px, transparent 1px, transparent 260px),
    radial-gradient(circle at 20% 30%, rgba(56,189,248,0.14), transparent 45%),
    radial-gradient(circle at 80% 60%, rgba(167,139,250,0.14), transparent 50%)
  `,
  backgroundAttachment: "fixed"
};

const header = { textAlign: "center", marginBottom: 20 };
const title = { fontSize: "2rem", margin: 0 };
const subtitle = { marginTop: 8, color: "#cbd5f5", fontSize: 14 };
const helpButton = { position: "absolute", top: 20, right: 20, padding: "6px 12px", borderRadius: 8, fontSize: 12, textDecoration: "none", color: "#7dd3fc", border: "1px solid #1e293b", background: "rgba(2,6,23,0.7)" };
const regionRow = { display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 };
const regionLabel = { color: "#7dd3fc", fontSize: 14 };
const regionSelect = { background: "#020617", color: "#e5e7eb", border: "1px solid #1e293b", padding: "4px 8px", borderRadius: 6 };
const signalBox = { maxWidth: 800, margin: "0 auto 15px", padding: 14, border: "1px solid #1e293b", borderRadius: 12, background: "rgba(2,6,23,0.75)" };
const layout = { display: "grid", gap: 25, maxWidth: 1100, margin: "0 auto" };
const card = { padding: 20, borderRadius: 16, border: "1px solid #1e293b", background: "rgba(2,6,23,0.78)" };
const input = { width: "100%", padding: 10, marginTop: 4, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, color: "white" };
const row = { display: "flex", justifyContent: "space-between", marginTop: 6 };
const rowInput = { width: 80, background: "transparent", border: "none", borderBottom: "1px solid #38bdf8", color: "#38bdf8", textAlign: "right" };
const aiButton = { width: "100%", padding: 12, background: "#38bdf8", border: "none", borderRadius: 10, fontWeight: "bold", cursor: "pointer", color: "#020617" };
const aiTextStyle = { marginTop: 10, whiteSpace: "pre-wrap", color: "#cbd5f5", fontSize: 14, lineHeight: "1.6" };
const exportBtn = { padding: "8px 12px", borderRadius: 8, border: "1px solid #1e293b", background: "transparent", color: "#38bdf8", cursor: "pointer", fontSize: 13 };
const footer = { marginTop: 40, textAlign: "center", fontSize: 12, color: "#64748b", paddingBottom: 20 };
