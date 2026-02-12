import React, { useState, useEffect } from "react";
import {
  saveMonthlySnapshot,
  getMonthlySnapshots,
  getSnapshotByDay,
} from "../lib/monthlyArchive";

/* ==========================================================================
   WEALTHYAI CORE DESIGN SYSTEM
   ========================================================================== */

const THEME = {
  bg: "#020617",
  surface: "rgba(2, 6, 23, 0.8)",
  glass: "rgba(255, 255, 255, 0.03)",
  border: "rgba(255, 255, 255, 0.07)",
  accent: "#38bdf8",
  textMain: "#f8fafc",
  textDim: "#64748b",
  textMuted: "rgba(255, 255, 255, 0.3)",
};

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

const REGIONS = [
  { code: "US", label: "UNITED STATES" },
  { code: "EU", label: "EUROPEAN UNION" },
  { code: "UK", label: "UNITED KINGDOM" },
  { code: "HU", label: "HUNGARY" },
  { code: "OTHER", label: "OTHER REGIONS" },
];

/* ==========================================================================
   COMPONENTS: TICKER & UI ELEMENTS
   ========================================================================== */

const WealthyTicker = ({ isMobile }) => {
  if (isMobile) return null;
  const tickerText = "WEALTHYAI INTERPRETS YOUR FINANCIAL STATE • INTERPRETATION OVER ADVICE • CLARITY OVER CERTAINTY • INSIGHT UNFOLDS OVER TIME • FINANCIAL UNDERSTANDING ISN'T INSTANT • CONTEXT CHANGES • INSIGHT FOLLOWS TIME • BUILT ON ATTENTION, NOT URGENCY • ";

  return (
    <div style={styles.tickerWrapper}>
      <div style={styles.tickerContent}>
        <span>{tickerText}</span>
        <span>{tickerText}</span>
      </div>
    </div>
  );
};

export default function PremiumMonth() {
  const [isMobile, setIsMobile] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);
  const [stressFactor, setStressFactor] = useState(0); 
  const [region, setRegion] = useState("EU");
  const [country, setCountry] = useState(null);
  const [viewMode, setViewMode] = useState("executive");
  const [cycleDay, setCycleDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [aiVisible, setAiVisible] = useState(false);
  const [dailySignal, setDailySignal] = useState(null);
  const [dailyPending, setDailyPending] = useState(true);
  const [dailyDual, setDailyDual] = useState(null);
  const [dailySnapshot, setDailySnapshot] = useState(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [exportRange, setExportRange] = useState("day");
  const [isTodayAvailable, setIsTodayAvailable] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const [focusPreview, setFocusPreview] = useState(null);

  const [inputs, setInputs] = useState({
    income: 4000, housing: 1200, electricity: 120, gas: 90, water: 40,
    internet: 60, mobile: 40, tv: 30, insurance: 150, banking: 20,
    unexpected: 200, other: 300,
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const calculateFragility = () => {
    const totalFixed = inputs.housing + inputs.electricity + inputs.gas + inputs.water + inputs.internet + inputs.mobile + inputs.tv + inputs.insurance + inputs.banking;
    if (!inputs.income || inputs.income <= 0) return "100.0";
    const energyBase = inputs.electricity + inputs.gas;
    const stressSurplus = (energyBase + inputs.unexpected + inputs.other) * stressFactor;
    return Math.min(Math.max(((totalFixed + stressSurplus) / inputs.income) * 100, 0), 100).toFixed(1);
  };

  /* ACCESS & CYCLE LOGIC */
  useEffect(() => {
    const vipToken = localStorage.getItem("wai_vip_token");
    if (vipToken === "MASTER-DOMINANCE-2026") return;
    const monthlyVips = ["WAI-GUEST-7725", "WAI-CLIENT-8832", "WAI-PARTNER-9943"];
    if (monthlyVips.includes(vipToken)) {
      const firstUsedKey = `start_time_${vipToken}`;
      const firstUsedAt = localStorage.getItem(firstUsedKey);
      if (!firstUsedAt) { localStorage.setItem(firstUsedKey, Date.now().toString()); return; }
      if (Date.now() - parseInt(firstUsedAt) > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem("wai_vip_token"); window.location.href = "/start";
      }
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (!params.get("session_id")) { window.location.href = "/start"; return; }
  }, []);

  useEffect(() => {
    const start = localStorage.getItem("subscriptionPeriodStart") || localStorage.getItem("monthCycleStart");
    if (!start) {
      localStorage.setItem("monthCycleStart", Date.now().toString()); setCycleDay(1);
    } else {
      const diff = Math.floor((Date.now() - Number(start)) / 86400000);
      setCycleDay(Math.min(diff + 1, 30));
    }
  }, []);

  const update = (key, value) => {
    setInputs({ ...inputs, [key]: Number(value) });
    setAiVisible(false); setDailyDual(null); setDailySnapshot(null);
  };

  const [weeklyFocus, setWeeklyFocus] = useState(() => {
    try { return JSON.parse(localStorage.getItem("weeklyFocus")); } catch { return null; }
  });

  const getCurrentWeekIndex = () => Math.floor((cycleDay - 1) / 7);

  const confirmWeeklyFocus = () => {
    if (!focusPreview) return;
    const focus = { key: focusPreview, weekIndex: getCurrentWeekIndex(), setAt: Date.now() };
    setWeeklyFocus(focus);
    localStorage.setItem("weeklyFocus", JSON.stringify(focus));
    setFocusPreview(null);
  };
  /* ==========================================================================
     AI & DATA LOGIC
     ========================================================================== */

  const runAI = async () => {
    setLoading(true); setSelectedDay(null); setSimulationActive(false);
    try {
      const res = await fetch("/api/get-ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, country, cycleDay, weeklyFocus: weeklyFocus?.key, ...inputs }),
      });
      const json = await res.json();
      if (json?.snapshot) {
        setDailyDual(json.snapshot); setViewMode("executive"); setAiVisible(true);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const runAIDual = async () => {
    if (!isTodayAvailable) return alert("Today's snapshot is not available yet.");
    setLoading(true); setSelectedDay(null);
    try {
      const res = await fetch("/api/get-ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, country, cycleDay, weeklyFocus: weeklyFocus?.key, ...inputs }),
      });
      const data = await res.json();
      if (data?.snapshot) {
        saveMonthlySnapshot(data.snapshot); setDailySnapshot(data.snapshot);
        setViewMode("executive"); setAiVisible(true);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const activeSnapshot = selectedDay ? getSnapshotByDay(selectedDay) : dailySnapshot;
  const activeDual = activeSnapshot || dailyDual;
  const activeText = activeDual && (viewMode === "executive" ? activeDual.executive : activeDual.directive);

  const downloadPDF = async () => {
    if (!activeText) return;
    const res = await fetch("/api/export-month-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: activeText, cycleDay, region }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "wealthyai-briefing.pdf"; a.click();
  };

  const confirmAndSendEmail = async () => {
    if (!userEmail) return;
    setEmailSending(true);
    try {
      await fetch("/api/send-month-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: activeText, cycleDay, region, email: userEmail }),
      });
      setEmailModalOpen(false);
    } catch (err) { alert("Error."); }
    setEmailSending(false);
  };

  /* ==========================================================================
     RENDER ENGINE
     ========================================================================== */

  return (
    <div style={styles.page}>
      <WealthyTicker isMobile={isMobile} />
      
      <header style={styles.header}>
        <h1 style={styles.title}>WEALTHYAI <span style={{opacity: 0.2}}>|</span> INTELLIGENCE</h1>
        <p style={styles.subtitle}>CONTINUITY OVER INSTANT OUTPUT</p>
      </header>

      <main style={styles.container}>
        {/* TOP STATUS BAR */}
        <div style={styles.statusGrid}>
          <div style={styles.statusCard}>
            <span style={styles.miniLabel}>REGION</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)} style={styles.ghostSelect}>
              {REGIONS.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
            </select>
          </div>
          <div style={styles.statusCard}>
            <span style={styles.miniLabel}>CYCLE PHASE</span>
            <div style={styles.statusValue}>DAY {cycleDay} <span style={styles.dimText}>/ 30</span></div>
          </div>
          <div style={styles.statusCard}>
            <span style={styles.miniLabel}>DAILY SIGNAL</span>
            <div style={styles.statusValue}>{dailyPending ? "FORMING..." : "ACTIVE"}</div>
          </div>
        </div>

        {/* WEEKLY FOCUS SELECTOR */}
        <section style={styles.focusSection}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span style={styles.miniLabel}>STRATEGIC FOCUS</span>
            <button onClick={() => setFocusOpen(!focusOpen)} style={styles.actionLink}>
              {focusOpen ? "CLOSE" : weeklyFocus ? "REDEFINE" : "SET FOCUS"}
            </button>
          </div>
          {focusOpen ? (
            <div style={styles.focusGrid}>
              {["stability", "spending", "resilience", "direction"].map(f => (
                <button 
                  key={f}
                  disabled={!!weeklyFocus && weeklyFocus.key !== f}
                  onClick={() => setFocusPreview(f)}
                  style={{
                    ...styles.focusBtn,
                    borderColor: (focusPreview === f || weeklyFocus?.key === f) ? THEME.accent : THEME.border,
                    color: (focusPreview === f || weeklyFocus?.key === f) ? THEME.accent : THEME.textMain,
                    opacity: (weeklyFocus && weeklyFocus.key !== f) ? 0.3 : 1
                  }}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          ) : (
            <div style={{marginTop: 10, fontSize: 14}}>{weeklyFocus ? weeklyFocus.key.toUpperCase() : "NO FOCUS DEFINED"}</div>
          )}
          {focusPreview && !weeklyFocus && (
            <button onClick={confirmWeeklyFocus} style={styles.confirmBtn}>LOCK FOCUS</button>
          )}
        </section>

        {/* MAIN INTERACTIVE GRID */}
        <div style={{...styles.mainGrid, gridTemplateColumns: isMobile ? "1fr" : "1fr 1.4fr"}}>
          
          {/* INPUT PANEL */}
          <div style={styles.panel}>
            <h3 style={styles.panelTitle}>STRUCTURE</h3>
            <div style={styles.inputGroup}>
              <label style={styles.miniLabel}>MONTHLY INCOME</label>
              <input type="number" value={inputs.income} onChange={(e) => update("income", e.target.value)} style={styles.mainInput} />
            </div>

            <div style={styles.divider} />
            
            <div style={styles.inputRow}>
              <span style={styles.rowLabel}>Housing</span>
              <input type="number" value={inputs.housing} onChange={(e) => update("housing", e.target.value)} style={styles.ghostInput} />
            </div>
            <div style={styles.inputRow}>
              <span style={styles.rowLabel}>Fixed Utilities</span>
              <input type="number" value={inputs.electricity + inputs.gas} onChange={() => {}} style={styles.ghostInput} />
            </div>

            <div style={styles.stressBox}>
              <span style={styles.miniLabel}>STRESS TEST: {Math.round(stressFactor * 100)}%</span>
              <input type="range" min="0" max="1" step="0.01" value={stressFactor} onChange={(e) => {setStressFactor(parseFloat(e.target.value)); setSimulationActive(true);}} style={styles.slider} />
            </div>

            <div style={styles.buttonGrid}>
              <button onClick={() => {setSimulationActive(true); setAiVisible(false);}} style={styles.secondaryBtn}>SIMULATE</button>
              <button onClick={runAI} style={styles.primaryBtn}>{loading ? "..." : "GENERATE"}</button>
            </div>
          </div>

          {/* INTELLIGENCE PANEL (THE ALTAR) */}
          <div style={{...styles.panel, border: `1px solid ${aiVisible ? THEME.accent : THEME.border}`, transition: '0.5s'}}>
            {!aiVisible && !simulationActive && (
              <div style={styles.emptyState}>
                <h2 style={{fontWeight: 300, letterSpacing: 2}}>Interpretation over Advice.</h2>
                <p style={styles.dimmedText}>The system rewards attention. Enter your parameters to begin the briefing.</p>
              </div>
            )}

            {simulationActive && !aiVisible && (
              <div style={styles.simulationContent}>
                <span style={styles.accentLabel}>STRUCTURAL FRAGILITY</span>
                <div style={styles.fragilityValue}>{calculateFragility()}%</div>
                <div style={styles.progressBase}><div style={{...styles.progressFill, width: `${calculateFragility()}%`}} /></div>
              </div>
            )}

            {aiVisible && (
              <div style={styles.aiContent}>
                <div style={styles.tabs}>
                  <button onClick={() => setViewMode("executive")} style={{...styles.tab, color: viewMode==="executive" ? THEME.accent : THEME.textDim}}>EXECUTIVE</button>
                  <button onClick={() => setViewMode("directive")} style={{...styles.tab, color: viewMode==="directive" ? THEME.accent : THEME.textDim}}>DIRECTIVE</button>
                </div>
                <div style={styles.briefingText}>{activeText}</div>
                <div style={styles.exportBar}>
                  <button onClick={downloadPDF} style={styles.miniBtn}>PDF</button>
                  <button onClick={() => setEmailModalOpen(true)} style={styles.miniBtn}>EMAIL</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* EMAIL MODAL */}
      {emailModalOpen && (
        <div style={styles.modal}>
          <div style={styles.modalCard}>
            <span style={styles.miniLabel}>SEND REPORT</span>
            <input type="email" placeholder="EMAIL ADDRESS" value={userEmail} onChange={e => setUserEmail(e.target.value)} style={styles.modalInput} />
            <div style={{display:'flex', gap: 10}}>
              <button onClick={() => setEmailModalOpen(false)} style={styles.secondaryBtn}>CANCEL</button>
              <button onClick={confirmAndSendEmail} style={styles.primaryBtn}>SEND</button>
            </div>
          </div>
        </div>
      )}

      <footer style={styles.footer}>© 2026 WEALTHYAI · MEASURING CONTINUITY</footer>

      <style>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}

/* ==========================================================================
   THE "ARCHITECTURE" (STYLES)
   ========================================================================== */

const THEME = {
  bg: "#020617", accent: "#38bdf8", textMain: "#f8fafc", textDim: "#64748b", border: "rgba(255,255,255,0.08)"
};

const styles = {
  page: { minHeight: "100vh", backgroundColor: THEME.bg, color: THEME.textMain, fontFamily: "'Inter', sans-serif", padding: "60px 20px" },
  header: { textAlign: "center", marginBottom: 50 },
  title: { fontSize: 16, letterSpacing: "0.6em", fontWeight: 300, margin: 0 },
  subtitle: { fontSize: 9, letterSpacing: "0.3em", color: THEME.textDim, marginTop: 10 },
  container: { maxWidth: 1100, margin: "0 auto" },
  
  tickerWrapper: { position: "fixed", top: 0, left: 0, width: "100%", height: 30, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${THEME.border}`, zIndex: 1000, overflow: "hidden", display: 'flex', alignItems: 'center' },
  tickerContent: { whiteSpace: "nowrap", fontSize: 8, letterSpacing: "0.2em", color: THEME.textDim, animation: "ticker 60s linear infinite" },
  
  statusGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 1, background: THEME.border, border: `1px solid ${THEME.border}`, marginBottom: 30 },
  statusCard: { background: THEME.bg, padding: 20 },
  miniLabel: { fontSize: 9, letterSpacing: "0.2em", color: THEME.textDim, display: "block", marginBottom: 8 },
  statusValue: { fontSize: 14, fontWeight: 500 },
  dimText: { color: THEME.textDim, fontSize: 12 },
  
  ghostSelect: { background: "none", border: "none", color: THEME.accent, fontSize: 13, letterSpacing: "0.1em", cursor: "pointer", outline: "none" },
  
  focusSection: { padding: 25, border: `1px solid ${THEME.border}`, marginBottom: 30 },
  focusGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 20 },
  focusBtn: { background: "none", border: "1px solid", padding: "10px", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer" },
  confirmBtn: { width: "100%", marginTop: 15, padding: 12, background: THEME.accent, border: "none", color: "#000", fontWeight: 700, fontSize: 11, cursor: "pointer" },
  actionLink: { background: "none", border: "none", color: THEME.accent, fontSize: 10, letterSpacing: "0.1em", cursor: "pointer" },

  mainGrid: { display: "grid", gap: 30 },
  panel: { background: "rgba(255,255,255,0.02)", padding: 30, border: `1px solid ${THEME.border}` },
  panelTitle: { fontSize: 12, letterSpacing: "0.3em", fontWeight: 400, marginBottom: 25, color: THEME.textDim },
  
  mainInput: { width: "100%", background: "none", border: "none", borderBottom: `1px solid ${THEME.border}`, color: THEME.textMain, fontSize: 24, padding: "10px 0", outline: "none" },
  inputRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  rowLabel: { fontSize: 13, color: THEME.textDim },
  ghostInput: { background: "none", border: "none", color: THEME.textMain, textAlign: "right", fontSize: 14, width: 80, borderBottom: "1px solid transparent" },
  
  stressBox: { marginTop: 30, padding: 20, background: "rgba(255,255,255,0.02)" },
  slider: { width: "100%", accentColor: THEME.accent, cursor: "pointer" },
  
  buttonGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginTop: 30 },
  primaryBtn: { background: THEME.textMain, color: THEME.bg, border: "none", padding: 15, fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", cursor: "pointer" },
  secondaryBtn: { background: "none", border: `1px solid ${THEME.border}`, color: THEME.textMain, padding: 15, fontSize: 11, letterSpacing: "0.1em", cursor: "pointer" },

  emptyState: { height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", opacity: 0.5 },
  dimmedText: { fontSize: 12, marginTop: 10, letterSpacing: "0.05em" },
  
  aiContent: { animation: "fadeIn 1s ease" },
  tabs: { display: "flex", gap: 25, marginBottom: 25, borderBottom: `1px solid ${THEME.border}`, paddingBottom: 15 },
  tab: { background: "none", border: "none", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", cursor: "pointer" },
  briefingText: { fontSize: 15, lineHeight: "1.8", color: "#cbd5e1", whiteSpace: "pre-wrap" },
  exportBar: { display: "flex", gap: 10, marginTop: 30 },
  miniBtn: { background: "none", border: `1px solid ${THEME.border}`, color: THEME.textDim, padding: "8px 15px", fontSize: 9, cursor: "pointer" },

  fragilityValue: { fontSize: 64, fontWeight: 200, margin: "20px 0", color: THEME.accent },
  progressBase: { height: 2, background: THEME.border, width: "100%" },
  progressFill: { height: "100%", background: THEME.accent, transition: "0.3s" },

  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 },
  modalCard: { background: THEME.bg, border: `1px solid ${THEME.border}`, padding: 40, width: "100%", maxWidth: 400 },
  modalInput: { width: "100%", background: "rgba(255,255,255,0.05)", border: "none", padding: 15, color: "#fff", marginBottom: 20, outline: "none" },
  
  footer: { textAlign: "center", marginTop: 80, fontSize: 8, letterSpacing: "0.4em", color: THEME.textDim }
};
