import React, { useState, useEffect } from "react";
import {
  saveMonthlySnapshot,
  getMonthlySnapshots,
  getSnapshotByDay,
} from "../lib/monthlyArchive";

/* ================= DAILY SIGNAL UNLOCK ================= */

const DAILY_SIGNAL_KEY = "dailySignalUnlock";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDailyUnlockTime() {
  const stored = JSON.parse(localStorage.getItem(DAILY_SIGNAL_KEY) || "{}");
  const today = getTodayKey();

  if (stored.date === today) return stored.unlockAt;

  const hour = Math.floor(Math.random() * 10) + 7; // 07–16 óra között
  const minute = Math.floor(Math.random() * 60);

  const unlockAt = new Date();
  unlockAt.setHours(hour, minute, 0, 0);

  localStorage.setItem(
    DAILY_SIGNAL_KEY,
    JSON.stringify({ date: today, unlockAt: unlockAt.getTime() })
  );

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

export default function PremiumMonth() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= SIMULATION & STRESS STATE (NEW) ================= */
  const [simulationActive, setSimulationActive] = useState(false);
  const [stressFactor, setStressFactor] = useState(0); // 0 to 1 (0% to 100%)

  // Alapvető algoritmus a törékenység mérésére
  const calculateFragility = () => {
    const energy = (inputs.electricity + inputs.gas) * (1 + stressFactor);
    const fixed = inputs.housing + inputs.insurance + inputs.banking + energy;
    const ratio = (fixed / inputs.income) * 100;
    return Math.min(Math.max(ratio, 0), 100).toFixed(1);
  };

  /* ================= AI PANEL CONTROLS (ENHANCED) ================= */
  const toggleSimulation = () => {
    setSimulationActive(true);
    setAiVisible(false); // Eltünteti a hitvallást, ha aktív a szimuláció
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
      .then((r) => r.json())
      .then((d) => {
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
    return () => {
      cancelled = true;
    };
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

    // Ha módosul az adat, az AI eredményt elrejtjük, hogy frissíteni kelljen
    setAiVisible(false);
    setAiCollapsed(true);
    setDailyDual(null);
    setDailySnapshot(null);
    setSelectedDay(null);
  };

  /* ================= CYCLE LOGIC ================= */

  useEffect(() => {
    const start =
      localStorage.getItem("subscriptionPeriodStart") ||
      localStorage.getItem("monthCycleStart");

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
        body: JSON.stringify({
          region,
          country,
          cycleDay,
        }),
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

  /* ================= LEGACY DAILY STORAGE ================= */

  const saveBriefing = (dual) => {
    const today = getTodayKey();
    const stored = JSON.parse(localStorage.getItem("monthlyBriefings")) || [];

    if (!stored.find((b) => b.date === today)) {
      stored.push({
        id: Date.now(),
        date: today,
        cycleDay,
        executive: dual.executive,
        directive: dual.directive,
      });
      localStorage.setItem(
        "monthlyBriefings",
        JSON.stringify(stored.slice(-30))
      );
    }
  };

  /* ================= DAILY AI BRIEFING ================= */

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
      console.error(err);
    }

    setLoading(false);
  };

  /* ================= SNAPSHOT AI BRIEFING ================= */

  const runAIDual = async () => {
    if (!isTodayAvailable) {
      alert("Today's snapshot is not available yet. Please check back later.");
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
      console.error(err);
    }

    setLoading(false);
  };

  /* ================= ACTIVE CONTENT ================= */

  const activeSnapshot = selectedDay
    ? getSnapshotByDay(selectedDay)
    : dailySnapshot;

  const activeDual = activeSnapshot || dailyDual;

  const activeText =
    activeDual &&
    (viewMode === "executive"
      ? activeDual.executive
      : activeDual.directive);

  /* ================= EXPORT LOGIC ================= */

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
      return combined.filter((b) => b.date === today);
    }
    if (range === "week") return combined.slice(-7);
    if (range === "month") return combined;
    return [];
  };

  const handleDownload = () => {
    const data = getBriefings(exportRange);
    if (!data.length) {
      alert("No saved briefing data available for this range.");
      return;
    }

    const text = data
      .map(
        (b) =>
          `Day ${b.cycleDay} · ${b.date}\n\n${
            viewMode === "executive" ? b.executive : b.directive
          }`
      )
      .join("\n\n----------------------------------\n\n");

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WealthyAI_Briefing_${exportRange}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    if (!activeText) return;
    try {
      const res = await fetch("/api/export-month-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: activeText,
          cycleDay,
          region,
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wealthyai-monthly-briefing-day${cycleDay}.pdf`;
      a.click();
    } catch (err) {
      console.error(err);
    }
  };

  const sendEmailPDF = async () => {
    if (!activeText) return;
    setEmailSending(true);
    try {
      await fetch("/api/send-month-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: activeText,
          cycleDay,
          region,
        }),
      });
      alert("Briefing sent to your email.");
    } catch (err) {
      console.error(err);
    }
    setEmailSending(false);
  };

  /* ================= RENDER ================= */
return (
    <div
      style={{
        ...page,
        overflowX: isMobile ? "hidden" : undefined,
        backgroundAttachment: "fixed",
      }}
    >
      <a href="/month/help" style={helpButton}>Help</a>

      <div style={header}>
        <h1 style={title}>WEALTHYAI · MONTHLY BRIEFING</h1>
        <p style={subtitle}>Strategic financial outlook · Next 90 days</p>
      </div>

      <div style={regionRow}>
        <span style={regionLabel}>Region</span>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          style={regionSelect}
        >
          {REGIONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
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
          <p style={{ opacity: 0.7 }}>Today’s signal is still forming.</p>
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
        <div style={card}>
          <h3 style={{ fontSize: "18px", marginBottom: "20px", color: "#fff" }}>Monthly Financial Structure</h3>

          <Label>Income</Label>
          <Input
            value={inputs.income}
            onChange={(e) => update("income", e.target.value)}
          />
          
          <Divider />

          <Section title="Living">
            <Row
              label="Housing"
              value={inputs.housing}
              onChange={(v) => update("housing", v)}
            />
          </Section>

          <Section title="Utilities">
            <Row label="Electricity" value={inputs.electricity} onChange={(v) => update("electricity", v)} />
            <Row label="Gas" value={inputs.gas} onChange={(v) => update("gas", v)} />
            <Row label="Water" value={inputs.water} onChange={(v) => update("water", v)} />
          </Section>

          <Section title="Recurring Services">
            <Row label="Internet" value={inputs.internet} onChange={(v) => update("internet", v)} />
            <Row label="Mobile phone" value={inputs.mobile} onChange={(v) => update("mobile", v)} />
            <Row label="TV / Streaming" value={inputs.tv} onChange={(v) => update("tv", v)} />
            <Row label="Insurance" value={inputs.insurance} onChange={(v) => update("insurance", v)} />
            <Row label="Banking fees" value={inputs.banking} onChange={(v) => update("banking", v)} />
          </Section>

          <Section title="Other">
            <Row label="Unexpected" value={inputs.unexpected} onChange={(v) => update("unexpected", v)} />
            <Row label="Miscellaneous" value={inputs.other} onChange={(v) => update("other", v)} />
          </Section>

          {/* STRESS TEST SECTION */}
          <Divider />
          <div style={{ padding: "10px 0" }}>
            <strong style={{ color: "#10b981", fontSize: 13, display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "1px" }}>
              Structural Stress Test
            </strong>
            <input 
              type="range" 
              min="0" max="1" step="0.01" 
              value={stressFactor}
              onChange={(e) => {
                setStressFactor(parseFloat(e.target.value));
                setSimulationActive(true);
              }}
              style={{ width: "100%", cursor: "pointer", accentColor: "#10b981" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", opacity: 0.5, marginTop: "5px" }}>
              <span>BASE STATE</span>
              <span>CRISIS (+100%)</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "20px" }}>
            <button 
              onClick={toggleSimulation}
              style={{ ...exportBtn, borderColor: "#10b981", color: "#10b981", fontWeight: "bold" }}
            >
              SIMULATE
            </button>
            <button 
              onClick={runAI} 
              disabled={loading}
              style={{ ...aiButton, marginTop: 0 }}
            >
              {loading ? "ANALYZING..." : "SHOW BRIEFING"}
            </button>
          </div>

          <button
            onClick={runAIDual}
            disabled={loading}
            style={{ ...exportBtn, marginTop: 12, width: "100%" }}
          >
            {loading ? "SAVING..." : "Save Today’s Snapshot"}
          </button>
        </div>

        {/* RIGHT COLUMN: INTELLIGENCE & VISUALS */}
        <div style={card}>
          
          {/* 1. STATE: MANIFESTO */}
          {!aiVisible && !simulationActive && (
            <div style={{ padding: "10px", animation: "fadeIn 0.8s ease-in" }}>
              <strong style={{ color: "#10b981", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
                WealthyAI Philosophy
              </strong>
              <h2 style={{ fontSize: "24px", marginBottom: "20px", color: "#fff" }}>Interpretation, Not Advice.</h2>
              <div style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px", lineHeight: "1.6" }}>
                <p>We built WealthyAI around a different question: What happens if AI doesn’t advise — but interprets? Not faster decisions, but <strong>clearer thinking</strong>.</p>
                <p style={{ marginTop: "15px" }}>Our system assumes that you remain responsible for decisions — it simply gives you a clearer frame to make them.</p>
                <p style={{ marginTop: "15px" }}>Financial insight changes when context changes. Context changes with time. WealthyAI doesn’t reward speed. It rewards <strong>attention</strong>.</p>
              </div>
            </div>
          )}

          {/* 2. STATE: SIMULATION ENGINE */}
          {simulationActive && !aiVisible && (
            <div style={{ padding: "10px", animation: "fadeIn 0.3s ease-out" }}>
              <strong style={{ color: "#10b981", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
                Live Simulation Engine
              </strong>
              <h2 style={{ fontSize: "22px", color: "#fff" }}>Structural Fragility Index</h2>
              
              <div style={{ fontSize: "48px", fontWeight: "bold", margin: "20px 0", color: "#38bdf8" }}>
                {calculateFragility()}%
              </div>

              <div style={{ height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", overflow: "hidden", marginTop: "10px" }}>
                <div style={{ 
                  height: "100%", 
                  width: `${calculateFragility()}%`, 
                  background: "linear-gradient(90deg, #10b981, #38bdf8)",
                  transition: "width 0.4s ease-out" 
                }} />
              </div>

              <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px", lineHeight: "1.6", marginTop: "20px" }}>
                This metric represents the weight of your non-negotiable costs against your income frame. 
                At a <strong>{Math.round(stressFactor * 100)}%</strong> simulated pressure, your rigidity index moves into 
                {parseFloat(calculateFragility()) > 55 ? " a critical zone." : " a manageable range."}
              </p>
              
              <button 
                onClick={() => setSimulationActive(false)} 
                style={{ ...exportBtn, marginTop: 25, fontSize: 12, opacity: 0.6 }}
              >
                Reset to Philosophy
              </button>
            </div>
          )}

          {/* 3. STATE: AI BRIEFING */}
          {aiVisible && (
            <div style={{ animation: "fadeIn 0.5s ease-in" }}>
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
                
                <button 
                  onClick={() => { setAiVisible(false); setSimulationActive(false); }} 
                  style={{ ...exportBtn, maxWidth: 44, borderColor: "rgba(255,255,255,0.2)" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", color: "rgba(255,255,255,0.9)", fontSize: "14px", fontFamily: "inherit" }}>
                {activeText}
              </div>

              {!selectedDay && (
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    gap: 12,
                    flexWrap: isMobile ? "wrap" : "nowrap",
                    paddingTop: 20,
                    borderTop: "1px solid rgba(255,255,255,0.1)"
                  }}
                >
                  <select
                    value={exportRange}
                    onChange={(e) => setExportRange(e.target.value)}
                    style={exportSelect}
                  >
                    <option value="day">Today</option>
                    <option value="week">Last 7 days</option>
                    <option value="month">This month</option>
                  </select>

                  <button onClick={handleDownload} style={exportBtn}>Text</button>
                  <button onClick={downloadPDF} style={exportBtn}>PDF</button>
                  <button onClick={sendEmailPDF} style={exportBtn}>
                    {emailSending ? "..." : "Email"}
                  </button>
                </div>
              )}
            </div>
          )}

          <Divider />
          <button
            onClick={() => setArchiveOpen(!archiveOpen)}
            style={{ ...exportBtn, width: "100%", borderColor: "rgba(56, 189, 248, 0.2)" }}
          >
            {archiveOpen ? "Hide Intelligence Archive" : "View Intelligence Archive"}
          </button>

          {archiveOpen && (
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {getMonthlySnapshots().map((s) => (
                <button
                  key={s.date}
                  onClick={() => { 
                    setSelectedDay(s.cycleDay); 
                    setAiVisible(true); 
                    setSimulationActive(false); 
                  }}
                  style={{ ...exportBtn, fontSize: 11, textAlign: "left" }}
                >
                  Day {s.cycleDay} · {s.date}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={footer}>© 2026 WealthyAI · Monthly Intelligence Framework</div>
    </div>
  );
}

/* ================= UI HELPERS & STYLES (NO CHANGES) ================= */

const Section = ({ title, children }) => (
  <div style={{ marginBottom: "15px" }}>
    <Divider />
    <strong style={{ fontSize: "12px", color: "#7dd3fc", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>
      {title}
    </strong>
    {children}
  </div>
);

const Row = ({ label, value, onChange }) => (
  <div style={row}>
    <span style={{ fontSize: "13px", opacity: 0.7 }}>{label}</span>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={rowInput}
    />
  </div>
);

const Label = ({ children }) => (
  <label style={{ marginBottom: "6px", display: "block", fontSize: "12px", opacity: 0.6, textTransform: "uppercase" }}>
    {children}
  </label>
);

const Input = ({ value, onChange }) => (
  <input 
    type="number" 
    value={value} 
    onChange={onChange} 
    style={{ ...input, outline: "none" }} 
  />
);

const Divider = () => (
  <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "16px 0" }} />
);

/* ================= STYLE OBJECTS ================= */

const page = {
  minHeight: "100vh",
  position: "relative",
  padding: "40px 20px",
  color: "#e5e7eb",
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  backgroundColor: "#05070a",
  backgroundImage: `
    repeating-linear-gradient(-25deg, rgba(56,189,248,0.03) 0px, rgba(56,189,248,0.03) 1px, transparent 1px, transparent 180px),
    repeating-linear-gradient(35deg, rgba(167,139,250,0.03) 0px, rgba(167,139,250,0.03) 1px, transparent 1px, transparent 260px),
    radial-gradient(circle at 20% 30%, rgba(56,189,248,0.08), transparent 45%),
    radial-gradient(circle at 80% 60%, rgba(167,139,250,0.08), transparent 50%)
  `,
};

const header = { textAlign: "center", marginBottom: "40px" };
const title = { fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.02em", margin: 0, color: "#fff" };
const subtitle = { marginTop: "10px", color: "#94a3b8", fontSize: "15px" };

const helpButton = {
  position: "absolute",
  top: "20px",
  right: "20px",
  padding: "8px 16px",
  borderRadius: "8px",
  fontSize: "12px",
  textDecoration: "none",
  color: "#7dd3fc",
  border: "1px solid rgba(125, 211, 252, 0.2)",
  background: "rgba(2, 6, 23, 0.4)",
  backdropFilter: "blur(4px)",
};

const regionRow = { display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginBottom: "30px" };
const regionLabel = { color: "#94a3b8", fontSize: "14px", fontWeight: "500" };
const regionSelect = { 
  background: "#0f172a", 
  color: "#f1f5f9", 
  border: "1px solid rgba(255,255,255,0.1)", 
  padding: "6px 12px", 
  borderRadius: "8px",
  fontSize: "14px",
  cursor: "pointer"
};

const signalBox = { 
  maxWidth: "800px", 
  margin: "0 auto 15px", 
  padding: "20px", 
  border: "1px solid rgba(255,255,255,0.05)", 
  borderRadius: "16px", 
  background: "rgba(13, 17, 23, 0.6)",
  backdropFilter: "blur(10px)"
};

const layout = { 
  display: "grid", 
  gridTemplateColumns: "1fr 1.3fr", 
  gap: "30px", 
  maxWidth: "1200px", 
  margin: "0 auto" 
};

const card = { 
  padding: "30px", 
  borderRadius: "20px", 
  border: "1px solid rgba(255,255,255,0.05)", 
  background: "rgba(13, 17, 23, 0.8)",
  backdropFilter: "blur(12px)",
  height: "fit-content"
};

const input = { 
  width: "100%", 
  padding: "12px", 
  marginTop: "8px", 
  background: "rgba(255,255,255,0.05)", 
  border: "1px solid rgba(255,255,255,0.1)", 
  borderRadius: "10px", 
  color: "#fff",
  fontSize: "15px"
};

const row = { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" };
const rowInput = { 
  width: "90px", 
  background: "transparent", 
  border: "none", 
  borderBottom: "1px solid rgba(56, 189, 248, 0.3)", 
  color: "#38bdf8", 
  textAlign: "right",
  padding: "4px",
  fontSize: "14px",
  fontWeight: "600",
  outline: "none"
};

const aiButton = { 
  width: "100%", 
  padding: "14px", 
  background: "#38bdf8", 
  border: "none", 
  borderRadius: "12px", 
  fontWeight: "700", 
  cursor: "pointer", 
  color: "#020617",
  transition: "transform 0.2s, opacity 0.2s",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const aiTextStyle = { 
  marginTop: "15px", 
  whiteSpace: "pre-wrap", 
  color: "#cbd5f5", 
  fontSize: "15px", 
  lineHeight: "1.7",
  fontFamily: "inherit"
};

const exportBtn = { 
  padding: "10px 18px", 
  borderRadius: "10px", 
  border: "1px solid rgba(56, 189, 248, 0.3)", 
  background: "transparent", 
  color: "#38bdf8", 
  cursor: "pointer", 
  fontSize: "13px",
  fontWeight: "600",
  transition: "all 0.2s"
};

const exportSelect = { 
  background: "rgba(15, 23, 42, 0.8)", 
  color: "#f1f5f9", 
  border: "1px solid rgba(255,255,255,0.1)", 
  padding: "10px", 
  borderRadius: "10px",
  fontSize: "13px"
};

const footer = { 
  marginTop: "60px", 
  textAlign: "center", 
  fontSize: "13px", 
  color: "#475569", 
  paddingBottom: "40px",
  letterSpacing: "0.5px"
};
