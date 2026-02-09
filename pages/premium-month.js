import { useState, useEffect, useMemo } from "react";
import Topography from "./Topography";
import {
  saveMonthlySnapshot,
  getMonthlySnapshots,
  getSnapshotByDay,
} from "../lib/monthlyArchive";

/* ==========================================================================
   DAILY SIGNAL UNLOCK SYSTEM (ORIGINAL LOGIC)
   ========================================================================== */

const DAILY_SIGNAL_KEY = "dailySignalUnlock";

function getTodayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function getDailyUnlockTime() {
  if (typeof window === "undefined") return 0;
  const stored = JSON.parse(localStorage.getItem(DAILY_SIGNAL_KEY) || "{}");
  const today = getTodayKey();

  if (stored.date === today) return stored.unlockAt;

  // Stratégiai időablak: 07:00 és 16:59 között generált random unlock
  const hour = Math.floor(Math.random() * 10) + 7;
  const minute = Math.floor(Math.random() * 60);

  const unlockAt = new Date();
  unlockAt.setHours(hour, minute, 0, 0);

  const timeVal = unlockAt.getTime();
  localStorage.setItem(
    DAILY_SIGNAL_KEY,
    JSON.stringify({ date: today, unlockAt: timeVal })
  );

  return timeVal;
}

/* ==========================================================================
   GLOBAL CONSTANTS & REGIONS
   ========================================================================== */

const REGIONS = [
  { code: "US", label: "United States (US)" },
  { code: "EU", label: "European Union (EU)" },
  { code: "UK", label: "United Kingdom (UK)" },
  { code: "HU", label: "Hungary (HU)" },
  { code: "OTHER", label: "International / Other" },
];

const WEEK_LENGTH = 7;

/* ==========================================================================
   PREMIUM MONTH COMPONENT
   ========================================================================== */

export default function PremiumMonth() {
  // === RESPONSIVE STATE ===
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= CORE FINANCIAL STATE ================= */

  const [inputs, setInputs] = useState({
    income: 4000,
    housing: 1200,
    electricity: 120,
    gas: 90,
    water: 45,
    internet: 60,
    mobile: 40,
    tv: 35,
    insurance: 155,
    banking: 25,
    unexpected: 200,
    other: 350,
    savingsGoal: 500,
    investmentRatio: 10
  });

  const [simulationActive, setSimulationActive] = useState(false);
  const [stressFactor, setStressFactor] = useState(0); 

  /* ================= ACCESS & AUTH LOGIC ================= */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    
    if (!sessionId) {
      const storedSession = localStorage.getItem("wealthy_session_id");
      if (!storedSession) {
        window.location.href = "/start";
        return;
      }
    } else {
      localStorage.setItem("wealthy_session_id", sessionId);
    }

    const verify = async () => {
      try {
        const r = await fetch("/api/verify-active-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionId || localStorage.getItem("wealthy_session_id") }),
        });
        const d = await r.json();
        if (!d.valid) window.location.href = "/start";
      } catch (e) {
        console.error("Auth sync error");
      }
    };
    verify();
  }, []);

  /* ================= GEOGRAPHIC CONTEXT ================= */

  const [region, setRegion] = useState("EU");
  const [country, setCountry] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchRegion = async () => {
      try {
        const r = await fetch("/api/detect-region");
        const j = await r.json();
        if (active && j?.region) setRegion(j.region);
        if (active && j?.country) setCountry(j.country);
      } catch (e) { /* Fallback to default EU */ }
    };
    fetchRegion();
    return () => { active = false; };
  }, []);

  /* ================= CYCLE & CALENDAR STATE ================= */

  const [cycleDay, setCycleDay] = useState(1);
  const [isTodayAvailable, setIsTodayAvailable] = useState(false);

  useEffect(() => {
    const start = localStorage.getItem("subscriptionPeriodStart") || localStorage.getItem("monthCycleStart");
    if (!start) {
      const now = Date.now().toString();
      localStorage.setItem("monthCycleStart", now);
      setCycleDay(1);
    } else {
      const diff = Math.floor((Date.now() - Number(start)) / 86400000);
      setCycleDay(Math.min(diff + 1, 30));
    }
  }, []);

  useEffect(() => {
    const today = getTodayKey();
    const key = `dailyAvailableAt_${today}`;
    let avail = localStorage.getItem(key);

    if (!avail) {
      const offset = Math.floor(Math.random() * 6 * 60 * 60 * 1000);
      const base = new Date();
      base.setHours(7, 0, 0, 0);
      avail = (base.getTime() + offset).toString();
      localStorage.setItem(key, avail);
    }

    const checker = setInterval(() => {
      if (Date.now() >= Number(avail)) {
        setIsTodayAvailable(true);
        clearInterval(checker);
      }
    }, 10000);
    
    if (Date.now() >= Number(avail)) setIsTodayAvailable(true);
    return () => clearInterval(checker);
  }, []);

  /* ================= AI PANEL & CONTENT STATE ================= */

  const [viewMode, setViewMode] = useState("executive");
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [aiVisible, setAiVisible] = useState(false);
  
  const [dailySignal, setDailySignal] = useState(null);
  const [dailyPending, setDailyPending] = useState(true);
  
  const [dailyDual, setDailyDual] = useState(null);
  const [dailySnapshot, setDailySnapshot] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [exportRange, setExportRange] = useState("day");

  /* ================= WEEKLY STRATEGY FOCUS ================= */

  const [weeklyFocus, setWeeklyFocus] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const f = localStorage.getItem("weeklyFocus");
      return f ? JSON.parse(f) : null;
    } catch { return null; }
  });

  const [focusOpen, setFocusOpen] = useState(false);
  const [focusPreview, setFocusPreview] = useState(null);

  const currentWeekIdx = useMemo(() => Math.floor((cycleDay - 1) / WEEK_LENGTH), [cycleDay]);

  const confirmWeeklyFocus = () => {
    if (!focusPreview) return;
    const focusData = {
      key: focusPreview,
      weekIndex: currentWeekIdx,
      setAt: Date.now()
    };
    setWeeklyFocus(focusData);
    localStorage.setItem("weeklyFocus", JSON.stringify(focusData));
    setFocusOpen(false);
  };

  /* ================= DATA HANDLERS ================= */

  const updateInput = (key, val) => {
    setInputs(prev => ({ ...prev, [key]: Number(val) }));
    setAiVisible(false);
    setDailyDual(null);
    setDailySnapshot(null);
    setSelectedDay(null);
  };

  const calculateTotalOut = () => {
    const { income, savingsGoal, investmentRatio, ...expenses } = inputs;
    const basic = Object.values(expenses).reduce((a, b) => a + b, 0);
    return basic * (1 + stressFactor);
  };

  /* ================= DAILY SIGNAL AUTO-FETCH ================= */

  useEffect(() => {
    const unlockTime = getDailyUnlockTime();
    const fetchSignal = async () => {
      if (Date.now() < unlockTime) return;
      
      const cacheKey = "dailySignalSeen_" + getTodayKey();
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        setDailySignal(cached);
        setDailyPending(false);
        return;
      }

      try {
        const r = await fetch("/api/get-daily-signal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ region, country, cycleDay }),
        });
        const j = await r.json();
        if (j?.signal) {
          localStorage.setItem(cacheKey, j.signal);
          setDailySignal(j.signal);
        }
      } catch (e) {}
      setDailyPending(false);
    };

    fetchSignal();
    const i = setInterval(fetchSignal, 60000);
    return () => clearInterval(i);
  }, [region, country, cycleDay]);

  /* ================= AI LOGIC CORE ================= */

  const runAI = async () => {
    setLoading(true);
    setAiVisible(false);
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
          ...inputs
        }),
      });
      const json = await res.json();
      if (json?.snapshot) {
        setDailyDual(json.snapshot);
        setViewMode("executive");
        setAiVisible(true);
        
        // Save to legacy history
        const history = JSON.parse(localStorage.getItem("monthlyBriefings") || "[]");
        if (!history.find(h => h.date === getTodayKey())) {
          history.push({
            id: Date.now(),
            date: getTodayKey(),
            cycleDay,
            executive: json.snapshot.executive,
            directive: json.snapshot.directive
          });
          localStorage.setItem("monthlyBriefings", JSON.stringify(history.slice(-30)));
        }
      }
    } catch (e) {
      console.error("AI Generation Failed");
    }
    setLoading(false);
  };

  const runAIDualSnapshot = async () => {
    if (!isTodayAvailable) return alert("Daily Snapshot is currently recalibrating. Check back later.");
    setLoading(true);
    try {
      const res = await fetch("/api/get-ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          country,
          cycleDay,
          weeklyFocus: weeklyFocus?.key,
          ...inputs
        }),
      });
      const data = await res.json();
      if (data?.snapshot) {
        saveMonthlySnapshot(data.snapshot);
        setDailySnapshot(data.snapshot);
        setViewMode("executive");
        setAiVisible(true);
      }
    } catch (e) {}
    setLoading(false);
  };

  /* ================= EXPORT & PDF SYSTEM ================= */

  const activeSnap = selectedDay ? getSnapshotByDay(selectedDay) : (dailySnapshot || dailyDual);
  const activeContent = activeSnap ? (viewMode === "executive" ? activeSnap.executive : activeSnap.directive) : "";

  const handleTextExport = () => {
    const snapshots = getMonthlySnapshots() || [];
    const legacy = JSON.parse(localStorage.getItem("monthlyBriefings") || "[]");
    let pool = [...legacy];
    snapshots.forEach(s => { if (!pool.find(p => p.date === s.date)) pool.push(s); });

    let final = pool;
    if (exportRange === "day") final = pool.filter(p => p.date === getTodayKey());
    if (exportRange === "week") final = pool.slice(-7);

    if (!final.length) return alert("No archive data found for export.");
    
    const output = final.map(f => `DATE: ${f.date} | DAY: ${f.cycleDay}\n\nSTRATEGY:\n${viewMode === "executive" ? f.executive : f.directive}`).join("\n\n" + "=".repeat(30) + "\n\n");
    
    const blob = new Blob([output], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `WealthyAI_Intelligence_${exportRange}.txt`;
    link.click();
  };

  const handlePDFExport = async () => {
    if (!activeContent) return;
    try {
      const res = await fetch("/api/export-month-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: activeContent, cycleDay, region }),
      });
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `WealthyAI_Briefing_D${cycleDay}.pdf`;
      link.click();
    } catch (e) { alert("PDF Export Error"); }
  };

  /* ================= COMPONENT SUB-RENDERS ================= */

  const InputRow = ({ label, id, value }) => (
    <div style={styles.inputRow}>
      <span style={styles.inputLabel}>{label}</span>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => updateInput(id, e.target.value)} 
        style={styles.smallInput} 
      />
    </div>
  );

  const SectionTitle = ({ children }) => (
    <div style={styles.sectionHeader}>
      <span style={styles.sectionTitleText}>{children}</span>
      <div style={styles.sectionLine} />
    </div>
  );

  /* ==========================================================================
     MAIN RENDER
     ========================================================================== */

  return (
    <div style={styles.pageWrapper}>
      
      {/* TICKER - TISZTA FEHÉR SZÖVEG, ÁTLÁTSZÓ HÁTTÉR, KERET NÉLKÜL
      */}
      <div style={styles.tickerContainer}>
        <div style={styles.tickerScroll}>
          <div style={styles.tickerTrack}>
            <span style={styles.tickerText}>SYSTEM STATUS: OPERATIONAL · REGIONAL DATA SYNC: COMPLETE · AI INTERPRETATION ENGINE: ACTIVE · STRUCTURAL ANALYSIS: LIVE · </span>
            <span style={styles.tickerText}>SYSTEM STATUS: OPERATIONAL · REGIONAL DATA SYNC: COMPLETE · AI INTERPRETATION ENGINE: ACTIVE · STRUCTURAL ANALYSIS: LIVE · </span>
          </div>
        </div>
      </div>

      <a href="/month/help" style={styles.helpFloat}>Help & Documentation</a>

      {/* HEADER SECTION */}
      <div style={styles.header}>
        <h1 style={styles.mainTitle}>WEALTHYAI · MONTHLY BRIEFING</h1>
        <div style={styles.subHeader}>
          <p style={styles.subTitle}>Advanced Structural Financial Intelligence</p>
          <div style={styles.statusBadge}>STABLE</div>
        </div>
      </div>

      {/* GLOBAL CONTROLS */}
      <div style={styles.controlBar}>
        <div style={styles.regionSelector}>
          <span style={styles.controlLabel}>Operational Region</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)} style={styles.selectInput}>
            {REGIONS.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
          </select>
        </div>
      </div>

      {/* STATUS CARDS */}
      <div style={styles.topGrid}>
        <div style={styles.glassCard}>
          <div style={styles.cardHeader}>Cycle Progress</div>
          <div style={styles.cycleDisplay}>
            <span style={styles.cycleValue}>{cycleDay}</span>
            <span style={styles.cycleUnit}>/ 30 DAYS</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${(cycleDay / 30) * 100}%` }} />
          </div>
        </div>

        <div style={styles.glassCard}>
          <div style={styles.cardHeader}>Real-time Market Signal</div>
          {dailyPending ? (
            <div style={styles.shimmerText}>Synchronizing global data...</div>
          ) : (
            <div style={styles.signalText}>{dailySignal}</div>
          )}
        </div>

        <div style={styles.glassCard}>
          <div style={styles.cardHeader}>Weekly Strategic Focus</div>
          {weeklyFocus ? (
            <div style={styles.focusActive}>
              <div style={styles.focusTag}>{weeklyFocus.key.toUpperCase()}</div>
              <button onClick={() => setFocusOpen(true)} style={styles.changeBtn}>Re-calibrate</button>
            </div>
          ) : (
            <button onClick={() => setFocusOpen(true)} style={styles.actionBtnPrimary}>Define Focus</button>
          )}
        </div>
      </div>

      {/* MODAL: WEEKLY FOCUS */}
      {focusOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Select Strategic Priority</h3>
            <p>This focus area guides the AI in prioritizing different aspects of your financial structure.</p>
            <div style={styles.focusGrid}>
              {FOCUS_OPTIONS.map((opt, i) => {
                const disabled = i < currentWeekIdx;
                const active = focusPreview === opt.key;
                return (
                  <div 
                    key={opt.key}
                    onClick={() => !disabled && setFocusPreview(opt.key)}
                    style={{
                      ...styles.focusOption,
                      opacity: disabled ? 0.4 : 1,
                      borderColor: active ? "#38bdf8" : "#1e293b",
                      background: active ? "rgba(56, 189, 248, 0.1)" : "transparent"
                    }}
                  >
                    <strong>{opt.label}</strong>
                    <span style={{fontSize: 10}}>{disabled ? "(Closed)" : "Available"}</span>
                  </div>
                );
              })}
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setFocusOpen(false)} style={styles.btnSecondary}>Cancel</button>
              <button onClick={confirmWeeklyFocus} style={styles.btnPrimary}>Confirm Strategy</button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN INTERFACE LAYOUT */}
      <div style={{ ...styles.mainLayout, gridTemplateColumns: isMobile ? "1fr" : "420px 1fr" }}>
        
        {/* LEFT COLUMN: PARAMETER CONFIGURATION */}
        <div style={styles.configColumn}>
          <div style={styles.configCard}>
            <div style={styles.cardHeader}>Input Parameters</div>
            
            <div style={styles.inputGroup}>
              <label style={styles.fieldLabel}>Base Monthly Income</label>
              <input 
                type="number" 
                value={inputs.income} 
                onChange={(e) => updateInput("income", e.target.value)} 
                style={styles.mainInput} 
              />
            </div>

            <SectionTitle>Fixed Expenditures</SectionTitle>
            <InputRow label="Housing / Mortgage" id="housing" value={inputs.housing} />
            <InputRow label="Global Insurance" id="insurance" value={inputs.insurance} />
            <InputRow label="Banking & Admin" id="banking" value={inputs.banking} />

            <SectionTitle>Utility Structural Load</SectionTitle>
            <InputRow label="Electricity" id="electricity" value={inputs.electricity} />
            <InputRow label="Natural Gas" id="gas" value={inputs.gas} />
            <InputRow label="Water Systems" id="water" value={inputs.water} />

            <SectionTitle>Connectivity & Digital</SectionTitle>
            <InputRow label="Broadband" id="internet" value={inputs.internet} />
            <InputRow label="Mobile Networks" id="mobile" value={inputs.mobile} />
            <InputRow label="Digital Media / TV" id="tv" value={inputs.tv} />

            <SectionTitle>Variable Buffers</SectionTitle>
            <InputRow label="Unexpected Events" id="unexpected" value={inputs.unexpected} />
            <InputRow label="Miscellaneous" id="other" value={inputs.other} />

            <div style={styles.divider} />
            
            <div style={styles.stressSection}>
              <div style={styles.stressHeader}>
                <span style={styles.stressTitle}>STRUCTURAL STRESS TEST</span>
                <span style={styles.stressValue}>+{Math.round(stressFactor * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={stressFactor} 
                onChange={(e) => {
                  setStressFactor(parseFloat(e.target.value));
                  setSimulationActive(true);
                  setAiVisible(false);
                }} 
                style={styles.rangeSlider} 
              />
            </div>

            <div style={styles.actionGrid}>
              <button 
                onClick={() => { setSimulationActive(true); setAiVisible(false); }} 
                style={{ ...styles.btnSimulate, opacity: simulationActive ? 1 : 0.7 }}
              >
                SIMULATE
              </button>
              <button 
                onClick={runAI} 
                disabled={loading}
                style={styles.btnGenerate}
              >
                {loading ? "PROCESSING..." : "GENERATE AI"}
              </button>
            </div>

            <button 
              onClick={runAIDualSnapshot} 
              disabled={!isTodayAvailable || loading}
              style={{ ...styles.btnSnapshot, marginTop: 15 }}
            >
              {isTodayAvailable ? "LOCK DAILY SNAPSHOT" : "SNAPSHOT RECALIBRATING"}
            </button>
          </div>

          {/* DYNAMIC TOPOGRAPHY - CONDITIONAL RENDER WITH MAX-HEIGHT */}
          {aiVisible && (
            <div style={styles.miniTopoContainer}>
              <Topography 
                income={inputs.income} 
                spawnNumbers={true} 
                stressFactor={stressFactor} 
                speed={1.5 + stressFactor} 
              />
              <div style={styles.topoOverlay}>STRUCTURAL DATA STREAM</div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INTERPRETATION ENGINE */}
        <div style={styles.displayColumn}>
          <div style={styles.displayCard}>
            
            {!aiVisible && !simulationActive && (
              <div style={styles.emptyState}>
                <div style={styles.emptyTopo}>
                  <Topography 
                    income={inputs.income} 
                    spawnNumbers={false} 
                    stressFactor={stressFactor} 
                    speed={1} 
                  />
                </div>
                <div style={styles.emptyContent}>
                  <h2>Interpretation Engine Ready</h2>
                  <p>Configure your parameters and run the AI analysis to receive your strategic directive and executive summary.</p>
                  <div style={styles.hintBox}>
                    <strong>Tip:</strong> Increasing the Stress Factor allows you to test the resilience of your structure against inflation or sudden price hikes.
                  </div>
                </div>
              </div>
            )}

            {simulationActive && !aiVisible && (
              <div style={styles.simulationState}>
                <div style={styles.simHeader}>
                  <div style={styles.simTitle}>STRESS SIMULATION ACTIVE</div>
                  <div style={styles.fragilityValue}>
                    FRAGILITY INDEX: {calculateFragility()}%
                  </div>
                </div>
                <div style={styles.simTopoBox}>
                  <Topography 
                    income={inputs.income} 
                    spawnNumbers={true} 
                    stressFactor={stressFactor} 
                    speed={2} 
                  />
                </div>
                <div style={styles.simDetails}>
                  <div style={styles.detailItem}>
                    <span>Total Output (Stressed):</span>
                    <strong>{calculateTotalOut().toLocaleString()} units</strong>
                  </div>
                  <div style={styles.detailItem}>
                    <span>Remaining Liquidity:</span>
                    <strong>{(inputs.income - calculateTotalOut()).toLocaleString()} units</strong>
                  </div>
                </div>
                <button onClick={() => setSimulationActive(false)} style={styles.btnSecondary}>Reset Simulation</button>
              </div>
            )}

            {aiVisible && (
              <div style={styles.aiOutputContainer}>
                <div style={styles.aiTabs}>
                  <button 
                    onClick={() => setViewMode("executive")} 
                    style={{ ...styles.tabBtn, borderBottomColor: viewMode === "executive" ? "#38bdf8" : "transparent" }}
                  >
                    EXECUTIVE SUMMARY
                  </button>
                  <button 
                    onClick={() => setViewMode("directive")} 
                    style={{ ...styles.tabBtn, borderBottomColor: viewMode === "directive" ? "#38bdf8" : "transparent" }}
                  >
                    STRATEGIC DIRECTIVE
                  </button>
                  <button onClick={() => setAiVisible(false)} style={styles.closeBtn}>✕</button>
                </div>
                
                <div style={styles.aiContent}>
                  <pre style={styles.aiPre}>{activeContent}</pre>
                </div>

                <div style={styles.exportFooter}>
                  <div style={styles.exportLeft}>
                    <select value={exportRange} onChange={(e) => setExportRange(e.target.value)} style={styles.selectInputSmall}>
                      <option value="day">Today's Briefing</option>
                      <option value="week">Past 7 Days</option>
                      <option value="month">Full Month</option>
                    </select>
                    <button onClick={handleTextExport} style={styles.btnExport}>Export TXT</button>
                  </div>
                  <div style={styles.exportRight}>
                    <button onClick={handlePDFExport} style={styles.btnPDF}>Download PDF</button>
                    <button 
                      onClick={() => setEmailSending(true)} 
                      disabled={emailSending}
                      style={styles.btnEmail}
                    >
                      {emailSending ? "SENDING..." : "Send to Email"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ARCHIVE SYSTEM */}
            <div style={styles.archiveSection}>
              <div style={styles.divider} />
              <button 
                onClick={() => setArchiveOpen(!archiveOpen)} 
                style={styles.archiveToggle}
              >
                {archiveOpen ? "CLOSE INTELLIGENCE ARCHIVE" : "OPEN INTELLIGENCE ARCHIVE"}
              </button>
              
              {archiveOpen && (
                <div style={styles.archiveGrid}>
                  {getMonthlySnapshots().length > 0 ? (
                    getMonthlySnapshots().map(snap => (
                      <div 
                        key={snap.date} 
                        onClick={() => {
                          setSelectedDay(snap.cycleDay);
                          setAiVisible(true);
                        }} 
                        style={styles.archiveItem}
                      >
                        <span style={styles.archiveDate}>{snap.date}</span>
                        <span style={styles.archiveDay}>Day {snap.cycleDay}</span>
                      </div>
                    ))
                  ) : (
                    <div style={styles.noArchive}>No snapshots archived for this cycle yet.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.footerLine} />
        <p>© 2026 WealthyAI · Proprietary Financial Intelligence System · All Rights Reserved</p>
      </div>

      {/* GLOBAL KEYFRAMES */}
      <style>{`
        @keyframes tickerMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

/* ==========================================================================
   ENHANCED STYLES OBJECT (EXPANDED TO MATCH ORIGINAL FOOTPRINT)
   ========================================================================== */

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#020617",
    color: "#e2e8f0",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    padding: "100px 24px 60px",
    boxSizing: "border-box",
    position: "relative",
    overflowX: "hidden",
    backgroundImage: `
      repeating-linear-gradient(-25deg, rgba(56,189,248,0.03) 0px, rgba(56,189,248,0.03) 1px, transparent 1px, transparent 180px),
      repeating-linear-gradient(35deg, rgba(167,139,250,0.03) 0px, rgba(167,139,250,0.03) 1px, transparent 1px, transparent 260px),
      radial-gradient(circle at 15% 25%, rgba(56,189,248,0.12), transparent 40%),
      radial-gradient(circle at 85% 75%, rgba(167,139,250,0.12), transparent 45%)
    `,
    backgroundAttachment: "fixed"
  },
  tickerContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "36px",
    background: "transparent",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    overflow: "hidden"
  },
  tickerScroll: {
    width: "100%",
    overflow: "hidden"
  },
  tickerTrack: {
    display: "flex",
    whiteSpace: "nowrap",
    animation: "tickerMove 45s linear infinite"
  },
  tickerText: {
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "1.2px",
    paddingRight: "80px",
    textTransform: "uppercase"
  },
  helpFloat: {
    position: "absolute",
    top: "85px",
    right: "30px",
    padding: "8px 16px",
    borderRadius: "100px",
    border: "1px solid #1e293b",
    background: "rgba(15, 23, 42, 0.6)",
    color: "#38bdf8",
    fontSize: "12px",
    textDecoration: "none",
    fontWeight: "500",
    transition: "all 0.2s"
  },
  header: {
    textAlign: "center",
    marginBottom: "40px"
  },
  mainTitle: {
    fontSize: "2.6rem",
    fontWeight: "900",
    letterSpacing: "-0.04em",
    margin: 0,
    background: "linear-gradient(to bottom, #ffffff, #94a3b8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },
  subHeader: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "15px",
    marginTop: "10px"
  },
  subTitle: {
    color: "#94a3b8",
    fontSize: "16px",
    margin: 0
  },
  statusBadge: {
    padding: "2px 8px",
    background: "rgba(16, 185, 129, 0.1)",
    border: "1px solid #10b981",
    color: "#10b981",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "700"
  },
  controlBar: {
    maxWidth: "1200px",
    margin: "0 auto 30px",
    display: "flex",
    justifyContent: "center"
  },
  regionSelector: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(15, 23, 42, 0.4)",
    padding: "8px 20px",
    borderRadius: "12px",
    border: "1px solid #1e293b"
  },
  controlLabel: {
    fontSize: "13px",
    color: "#7dd3fc",
    fontWeight: "600"
  },
  selectInput: {
    background: "#020617",
    color: "#f8fafc",
    border: "1px solid #334155",
    borderRadius: "6px",
    padding: "4px 10px",
    outline: "none"
  },
  topGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    maxWidth: "1200px",
    margin: "0 auto 40px"
  },
  glassCard: {
    padding: "24px",
    background: "rgba(15, 23, 42, 0.7)",
    backdropFilter: "blur(12px)",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  cardHeader: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  cycleDisplay: {
    display: "flex",
    alignItems: "baseline",
    gap: "5px"
  },
  cycleValue: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#fff"
  },
  cycleUnit: {
    fontSize: "14px",
    color: "#64748b"
  },
  progressBar: {
    width: "100%",
    height: "6px",
    background: "#0f172a",
    borderRadius: "10px",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #38bdf8, #818cf8)",
    transition: "width 0.5s ease"
  },
  signalText: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#cbd5e1"
  },
  shimmerText: {
    fontSize: "14px",
    color: "#38bdf8",
    animation: "shimmer 2s infinite"
  },
  focusActive: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  focusTag: {
    padding: "6px 14px",
    background: "#38bdf8",
    color: "#020617",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "800"
  },
  changeBtn: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    fontSize: "12px",
    cursor: "pointer",
    textDecoration: "underline"
  },
  mainLayout: {
    display: "grid",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  configColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "25px"
  },
  configCard: {
    padding: "28px",
    background: "rgba(15, 23, 42, 0.8)",
    borderRadius: "24px",
    border: "1px solid #1e293b"
  },
  inputGroup: {
    marginBottom: "20px"
  },
  fieldLabel: {
    display: "block",
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "8px"
  },
  mainInput: {
    width: "100%",
    background: "#020617",
    border: "1px solid #334155",
    padding: "14px",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "600",
    boxSizing: "border-box"
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "25px 0 15px"
  },
  sectionTitleText: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#38bdf8",
    whiteSpace: "nowrap"
  },
  sectionLine: {
    width: "100%",
    height: "1px",
    background: "#1e293b"
  },
  inputRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
  },
  inputLabel: {
    fontSize: "14px",
    color: "#cbd5e1"
  },
  smallInput: {
    width: "100px",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #1e293b",
    color: "#38bdf8",
    textAlign: "right",
    padding: "4px",
    fontSize: "15px",
    outline: "none"
  },
  stressSection: {
    margin: "25px 0"
  },
  stressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px"
  },
  stressTitle: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#10b981"
  },
  stressValue: {
    fontSize: "12px",
    color: "#10b981"
  },
  rangeSlider: {
    width: "100%",
    accentColor: "#10b981",
    cursor: "pointer"
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px"
  },
  btnSimulate: {
    padding: "14px",
    background: "transparent",
    border: "1px solid #10b981",
    color: "#10b981",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer"
  },
  btnGenerate: {
    padding: "14px",
    background: "#38bdf8",
    border: "none",
    color: "#020617",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: "pointer"
  },
  btnSnapshot: {
    width: "100%",
    padding: "12px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid #334155",
    color: "#94a3b8",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer"
  },
  miniTopoContainer: {
    height: "280px",
    borderRadius: "24px",
    overflow: "hidden",
    border: "1px solid #1e293b",
    position: "relative"
  },
  topoOverlay: {
    position: "absolute",
    bottom: "15px",
    left: "20px",
    fontSize: "10px",
    color: "#38bdf8",
    letterSpacing: "2px",
    fontWeight: "700",
    opacity: 0.6
  },
  displayCard: {
    height: "100%",
    background: "rgba(15, 23, 42, 0.6)",
    borderRadius: "28px",
    border: "1px solid #1e293b",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box"
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "40px 0"
  },
  emptyTopo: {
    width: "100%",
    height: "300px",
    marginBottom: "30px",
    opacity: 0.5
  },
  emptyContent: {
    maxWidth: "500px"
  },
  hintBox: {
    marginTop: "40px",
    padding: "20px",
    background: "rgba(56, 189, 248, 0.05)",
    borderRadius: "16px",
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#64748b",
    border: "1px dashed rgba(56, 189, 248, 0.2)"
  },
  aiOutputContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    animation: "fadeIn 0.5s ease"
  },
  aiTabs: {
    display: "flex",
    gap: "25px",
    borderBottom: "1px solid #1e293b",
    marginBottom: "25px",
    position: "relative"
  },
  tabBtn: {
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    padding: "10px 0",
    color: "#f8fafc",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s"
  },
  closeBtn: {
    position: "absolute",
    right: 0,
    top: 0,
    background: "transparent",
    border: "none",
    color: "#64748b",
    fontSize: "18px",
    cursor: "pointer"
  },
  aiContent: {
    flexGrow: 1,
    overflowY: "auto",
    paddingRight: "10px"
  },
  aiPre: {
    whiteSpace: "pre-wrap",
    fontFamily: "inherit",
    fontSize: "15px",
    lineHeight: "1.8",
    color: "#cbd5e1",
    margin: 0
  },
  exportFooter: {
    marginTop: "30px",
    paddingTop: "25px",
    borderTop: "1px solid #1e293b",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px"
  },
  exportLeft: {
    display: "flex",
    gap: "10px",
    alignItems: "center"
  },
  exportRight: {
    display: "flex",
    gap: "10px"
  },
  selectInputSmall: {
    background: "#020617",
    color: "#94a3b8",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "6px 10px",
    fontSize: "12px"
  },
  btnExport: {
    padding: "8px 16px",
    background: "transparent",
    border: "1px solid #1e293b",
    color: "#cbd5e1",
    borderRadius: "8px",
    fontSize: "12px",
    cursor: "pointer"
  },
  btnPDF: {
    padding: "8px 20px",
    background: "#fff",
    color: "#020617",
    border: "none",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer"
  },
  btnEmail: {
    padding: "8px 20px",
    background: "rgba(56, 189, 248, 0.1)",
    color: "#38bdf8",
    border: "1px solid rgba(56, 189, 248, 0.3)",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer"
  },
  archiveSection: {
    marginTop: "40px"
  },
  archiveToggle: {
    width: "100%",
    padding: "12px",
    background: "transparent",
    border: "none",
    color: "#475569",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1px",
    cursor: "pointer",
    textDecoration: "underline"
  },
  archiveGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "12px",
    marginTop: "20px"
  },
  archiveItem: {
    padding: "12px",
    background: "rgba(2, 6, 23, 0.4)",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  archiveDate: {
    display: "block",
    fontSize: "11px",
    color: "#64748b",
    marginBottom: "4px"
  },
  archiveDay: {
    display: "block",
    fontSize: "13px",
    fontWeight: "700",
    color: "#38bdf8"
  },
  footer: {
    marginTop: "80px",
    textAlign: "center"
  },
  footerLine: {
    width: "60px",
    height: "2px",
    background: "#1e293b",
    margin: "0 auto 20px"
  },
  divider: {
    height: "1px",
    background: "#1e293b",
    margin: "20px 0"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(2, 6, 23, 0.9)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000
  },
  modalContent: {
    background: "#0f172a",
    padding: "40px",
    borderRadius: "32px",
    border: "1px solid #1e293b",
    maxWidth: "600px",
    width: "90%"
  },
  focusGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    margin: "30px 0"
  },
  focusOption: {
    padding: "20px",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px"
  },
  btnPrimary: {
    padding: "12px 24px",
    background: "#38bdf8",
    color: "#020617",
    border: "none",
    borderRadius: "100px",
    fontWeight: "700",
    cursor: "pointer"
  },
  btnSecondary: {
    padding: "12px 24px",
    background: "transparent",
    color: "#94a3b8",
    border: "1px solid #1e293b",
    borderRadius: "100px",
    fontWeight: "600",
    cursor: "pointer"
  }
};
