import React, { useState, useEffect } from "react";
import {
  saveMonthlySnapshot,
  getMonthlySnapshots,
  getSnapshotByDay,
} from "../lib/monthlyArchive";

/* ==========================================================================
   WEALTHYAI CORE DESIGN SYSTEM (THEME DEFINED ONCE)
   ========================================================================== */

const THEME = {
  bg: "#020617",
  surface: "rgba(2, 6, 23, 0.8)",
  glass: "rgba(255, 255, 255, 0.03)",
  border: "rgba(255, 255, 255, 0.08)",
  accent: "#38bdf8",
  textMain: "#f8fafc",
  textDim: "#64748b",
  textMuted: "rgba(255, 255, 255, 0.3)",
};

const DAILY_SIGNAL_KEY = "dailySignalUnlock";
function getTodayKey() { return new Date().toISOString().slice(0, 10); }

const REGIONS = [
  { code: "US", label: "UNITED STATES" },
  { code: "EU", label: "EUROPEAN UNION" },
  { code: "UK", label: "UNITED KINGDOM" },
  { code: "HU", label: "HUNGARY" },
  { code: "OTHER", label: "OTHER REGIONS" },
];

/* ==========================================================================
   COMPONENTS: TICKER
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

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

export default function PremiumMonth() {
  const [isMobile, setIsMobile] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);
  const [stressFactor, setStressFactor] = useState(0); 
  const [region, setRegion] = useState("EU");
  const [viewMode, setViewMode] = useState("executive");
  const [cycleDay, setCycleDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [aiVisible, setAiVisible] = useState(false);
  const [dailyPending, setDailyPending] = useState(true);
  const [dailyDual, setDailyDual] = useState(null);
  const [dailySnapshot, setDailySnapshot] = useState(null);
  const [focusOpen, setFocusOpen] = useState(false);
  const [focusPreview, setFocusPreview] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const [inputs, setInputs] = useState({
    income: 4000, housing: 1200, electricity: 120, gas: 90, water: 40,
    internet: 60, mobile: 40, tv: 30, insurance: 150, banking: 20,
    unexpected: 200, other: 300,
  });

  const [weeklyFocus, setWeeklyFocus] = useState(() => {
    if (typeof window !== "undefined") {
      try { return JSON.parse(localStorage.getItem("weeklyFocus")); } catch { return null; }
    }
    return null;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const start = localStorage.getItem("monthCycleStart");
    if (!start) {
      localStorage.setItem("monthCycleStart", Date.now().toString()); setCycleDay(1);
    } else {
      const diff = Math.floor((Date.now() - Number(start)) / 86400000);
      setCycleDay(Math.min(diff + 1, 30));
    }
    setDailyPending(false); // Simulating signal ready
  }, []);

  const calculateFragility = () => {
    const totalFixed = inputs.housing + inputs.electricity + inputs.gas + inputs.water + inputs.internet + inputs.mobile + inputs.tv + inputs.insurance + inputs.banking;
    if (!inputs.income || inputs.income <= 0) return "100.0";
    const energyBase = inputs.electricity + inputs.gas;
    const stressSurplus = (energyBase + inputs.unexpected + inputs.other) * stressFactor;
    return Math.min(Math.max(((totalFixed + stressSurplus) / inputs.income) * 100, 0), 100).toFixed(1);
  };

  const update = (key, value) => {
    setInputs({ ...inputs, [key]: Number(value) });
    setAiVisible(false); setDailyDual(null);
  };

  const confirmWeeklyFocus = () => {
    if (!focusPreview) return;
    const focus = { key: focusPreview, weekIndex: Math.floor((cycleDay - 1) / 7), setAt: Date.now() };
    setWeeklyFocus(focus);
    localStorage.setItem("weeklyFocus", JSON.stringify(focus));
    setFocusOpen(false);
    setFocusPreview(null);
  };

  const runAI = async () => {
    setLoading(true); setSimulationActive(false);
    try {
      const res = await fetch("/api/get-ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, cycleDay, weeklyFocus: weeklyFocus?.key, ...inputs }),
      });
      const json = await res.json();
      if (json?.snapshot) {
        setDailyDual(json.snapshot); setViewMode("executive"); setAiVisible(true);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const downloadPDF = async () => {
    const activeText = viewMode === "executive" ? dailyDual?.executive : dailyDual?.directive;
    if (!activeText) return;
    const res = await fetch("/api/export-month-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: activeText, cycleDay, region }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `wealthyai-day${cycleDay}.pdf`; a.click();
  };

  const confirmAndSendEmail = async () => {
    const activeText = viewMode === "executive" ? dailyDual?.executive : dailyDual?.directive;
    if (!userEmail || !activeText) return;
    setEmailSending(true);
    try {
      await fetch("/api/send-month-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: activeText, cycleDay, region, email: userEmail }),
      });
      setEmailModalOpen(false);
      alert("Email sent.");
    } catch (err) { alert("Error sending email."); }
    setEmailSending(false);
  };

  const activeText = dailyDual && (viewMode === "executive" ? dailyDual.executive : dailyDual.directive);

  return (
    <div style={styles.page}>
      <WealthyTicker isMobile={isMobile} />
      
      <header style={styles.header}>
        <h1 style={styles.title}>WEALTHYAI <span style={{opacity: 0.2}}>|</span> INTELLIGENCE</h1>
        <p style={styles.subtitle}>CONTINUITY OVER INSTANT OUTPUT</p>
      </header>

      <main style={styles.container}>
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
                  onClick={() => setFocusPreview(f)}
                  style={{
                    ...styles.focusBtn,
                    borderColor: (focusPreview === f || weeklyFocus?.key === f) ? THEME.accent : THEME.border,
                    color: (focusPreview === f || weeklyFocus?.key === f) ? THEME.accent : THEME.textMain,
                  }}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          ) : (
            <div style={{marginTop: 10, fontSize: 13, letterSpacing: '0.1em'}}>{weeklyFocus ? weeklyFocus.key.toUpperCase() : "NO FOCUS DEFINED"}</div>
          )}
          {focusPreview && !weeklyFocus && (
            <button onClick={confirmWeeklyFocus} style={styles.confirmBtn}>LOCK FOCUS</button>
          )}
        </section>

        <div style={{...styles.mainGrid, gridTemplateColumns: isMobile ? "1fr" : "1fr 1.4fr"}}>
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
              <span style={styles.rowLabel}>Essential Utils</span>
              <input type="number" value={inputs.electricity + inputs.gas + inputs.water} readOnly style={styles.ghostInput} />
            </div>

            <div style={styles.stressBox}>
              <span style={styles.miniLabel}>STRESS TEST: {Math.round(stressFactor * 100)}%</span>
              <input type="range" min="0" max="1" step="0.01" value={stressFactor} onChange={(e) => {setStressFactor(parseFloat(e.target.value)); setSimulationActive(true);}} style={styles.slider} />
            </div>

            <div style={styles.buttonGrid}>
              <button onClick={() => {setSimulationActive(true); setAiVisible(false);}} style={styles.secondaryBtn}>SIMULATE</button>
              <button onClick={runAI} style={styles.primaryBtn}>{loading ? "PROCESSING..." : "GENERATE"}</button>
            </div>
          </div>

          <div style={{...styles.panel, border: `1px solid ${aiVisible ? THEME.accent : THEME.border}`}}>
            {!aiVisible && !simulationActive && (
              <div style={styles.emptyState}>
                <h2 style={{fontWeight: 300, letterSpacing: 2}}>Interpretation over Advice.</h2>
                <p style={styles.dimmedText}>The system rewards attention. Enter your parameters to begin.</p>
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

      <style jsx global>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        body { background-color: #020617; margin: 0; }
      `}</style>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: THEME.bg, color: THEME.textMain, fontFamily: "'Inter', sans-serif", padding: "80px 20px 40px" },
  header: { textAlign: "center", marginBottom: 60 },
  title: { fontSize: 18, letterSpacing: "0.5em", fontWeight: 300, margin: 0 },
  subtitle: { fontSize: 9, letterSpacing: "0.2em", color: THEME.textDim, marginTop: 12 },
  container: { maxWidth: 1100, margin: "0 auto" },
  tickerWrapper: { position: "fixed", top: 0, left: 0, width: "100%", height: 35, background: "rgba(2,6,23,0.8)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${THEME.border}`, zIndex: 1000, overflow: "hidden", display: 'flex', alignItems: 'center' },
  tickerContent: { whiteSpace: "nowrap", fontSize: 8, letterSpacing: "0.2em", color: THEME.textDim, animation: "ticker 60s linear infinite" },
  statusGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 1, background: THEME.border, border: `1px solid ${THEME.border}`, marginBottom: 40 },
  statusCard: { background: THEME.bg, padding: 25 },
  miniLabel: { fontSize: 9, letterSpacing: "0.2em", color: THEME.textDim, display: "block", marginBottom: 10, fontWeight: 600 },
  statusValue: { fontSize: 15, fontWeight: 500, letterSpacing: '0.05em' },
  dimText: { color: THEME.textDim, fontSize: 12 },
  ghostSelect: { background: "none", border: "none", color: THEME.accent, fontSize: 13, letterSpacing: "0.1em", cursor: "pointer", outline: "none", padding: 0 },
  focusSection: { padding: "30px", border: `1px solid ${THEME.border}`, marginBottom: 40, background: "rgba(255,255,255,0.01)" },
  focusGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginTop: 20 },
  focusBtn: { background: "none", border: "1px solid", padding: "12px", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer", transition: '0.2s' },
  confirmBtn: { width: "100%", marginTop: 20, padding: 15, background: THEME.textMain, border: "none", color: THEME.bg, fontWeight: 700, fontSize: 11, cursor: "pointer", letterSpacing: '0.1em' },
  actionLink: { background: "none", border: "none", color: THEME.accent, fontSize: 10, letterSpacing: "0.1em", cursor: "pointer", textDecoration: 'underline' },
  mainGrid: { display: "grid", gap: 40 },
  panel: { background: "rgba(255,255,255,0.02)", padding: 40, border: `1px solid ${THEME.border}`, position: 'relative' },
  panelTitle: { fontSize: 11, letterSpacing: "0.3em", fontWeight: 400, marginBottom: 35, color: THEME.textDim, textTransform: 'uppercase' },
  mainInput: { width: "100%", background: "none", border: "none", borderBottom: `1px solid ${THEME.border}`, color: THEME.textMain, fontSize: 32, padding: "10px 0", outline: "none", fontWeight: 300 },
  inputRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  rowLabel: { fontSize: 14, color: THEME.textDim },
  ghostInput: { background: "none", border: "none", color: THEME.textMain, textAlign: "right", fontSize: 15, width: 100, outline: "none" },
  stressBox: { marginTop: 40, padding: 25, background: "rgba(255,255,255,0.02)", border: `1px solid ${THEME.border}` },
  slider: { width: "100%", accentColor: THEME.textMain, cursor: "pointer", marginTop: 15 },
  buttonGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 40 },
  primaryBtn: { background: THEME.textMain, color: THEME.bg, border: "none", padding: 18, fontWeight: 700, fontSize: 11, letterSpacing: "0.2em", cursor: "pointer", transition: '0.3s' },
  secondaryBtn: { background: "none", border: `1px solid ${THEME.border}`, color: THEME.textMain, padding: 18, fontSize: 11, letterSpacing: "0.2em", cursor: "pointer" },
  emptyState: { height: "100%", minHeight: 300, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", opacity: 0.4 },
  dimmedText: { fontSize: 13, marginTop: 15, letterSpacing: "0.05em" },
  aiContent: { animation: "fadeIn 1s ease" },
  tabs: { display: "flex", gap: 30, marginBottom: 30, borderBottom: `1px solid ${THEME.border}`, paddingBottom: 15 },
  tab: { background: "none", border: "none", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", cursor: "pointer", transition: '0.3s' },
  briefingText: { fontSize: 16, lineHeight: "1.9", color: "#d1d5db", whiteSpace: "pre-wrap", fontWeight: 300 },
  exportBar: { display: "flex", gap: 15, marginTop: 40, borderTop: `1px solid ${THEME.border}`, paddingTop: 25 },
  miniBtn: { background: "none", border: `1px solid ${THEME.border}`, color: THEME.textDim, padding: "10px 20px", fontSize: 10, cursor: "pointer", letterSpacing: '0.1em' },
  fragilityValue: { fontSize: 72, fontWeight: 200, margin: "25px 0", color: THEME.accent, letterSpacing: '-2px' },
  progressBase: { height: 1, background: THEME.border, width: "100%", marginTop: 20 },
  progressFill: { height: "100%", background: THEME.accent, transition: "0.6s cubic-bezier(0.4, 0, 0.2, 1)" },
  accentLabel: { fontSize: 10, letterSpacing: "0.3em", color: THEME.accent, fontWeight: 700 },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: 'blur(5px)' },
  modalCard: { background: THEME.bg, border: `1px solid ${THEME.border}`, padding: 50, width: "100%", maxWidth: 450 },
  modalInput: { width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${THEME.border}`, padding: 18, color: "#fff", marginBottom: 30, outline: "none", fontSize: 16 },
  footer: { textAlign: "center", marginTop: 100, fontSize: 9, letterSpacing: "0.5em", color: THEME.textDim, paddingBottom: 40 }
};
