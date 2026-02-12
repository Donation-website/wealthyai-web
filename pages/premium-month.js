import { useState, useEffect } from "react";
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

/* ================= REGIONS ================= */

const REGIONS = [
  { code: "US", label: "United States" },
  { code: "EU", label: "European Union" },
  { code: "UK", label: "United Kingdom" },
  { code: "HU", label: "Hungary" },
  { code: "OTHER", label: "Other regions" },
];

/* ===== TICKER COMPONENT (POSITION FIXED - HIGHER) ===== */
const WealthyTicker = ({ isMobile }) => {
  if (isMobile) return null;

  const tickerText =
    "WealthyAI interprets your financial state over time — not advice, not prediction, just clarity • Interpretation over advice • Clarity over certainty • Insight unfolds over time • Financial understanding isn’t instant • Context changes • Insight follows time • Clarity over certainty • Built on time, not urgency • ";

  return (
    <div
      style={{
        position: "absolute",
        top: 5,
        left: 0,
        width: "100%",
        height: 20,
        overflow: "hidden",
        zIndex: 100,
        pointerEvents: "none",
        background: "transparent",
      }}
    >
      <div
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          fontSize: 10,
          fontWeight: "400",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: "#ffffff",
          animation: "waiScroll 60s linear infinite",
        }}
      >
        <span>{tickerText}</span>
        <span>{tickerText}</span>
      </div>
    </div>
  );
};

export default function PremiumMonth() {
  // === MOBILE ADDITION: device detection ===
  const [isMobile, setIsMobile] = useState(false);

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
    const totalFixed = 
      inputs.housing + 
      inputs.electricity + 
      inputs.gas + 
      inputs.water + 
      inputs.internet + 
      inputs.mobile + 
      inputs.tv + 
      inputs.insurance + 
      inputs.banking;

    if (!inputs.income || inputs.income <= 0) return "100.0";

    const energyBase = inputs.electricity + inputs.gas;
    const stressSurplus = (energyBase + inputs.unexpected + inputs.other) * stressFactor;
    
    const finalRatio = ((totalFixed + stressSurplus) / inputs.income) * 100;
    
    return Math.min(Math.max(finalRatio, 0), 100).toFixed(1);
  };

  /* ================= ACCESS CHECK (MASTER + STRIPE + 7-DAY VIP) ================= */

  useEffect(() => {
    const vipToken = localStorage.getItem("wai_vip_token");
    
    // 1. A Te örökös hozzáférésed
    if (vipToken === "MASTER-DOMINANCE-2026") return;

    // 2. A 3 speciális VIP kód a Havi modulhoz
    const monthlyVips = [
      "WAI-GUEST-7725", 
      "WAI-CLIENT-8832", 
      "WAI-PARTNER-9943"
    ];

    if (monthlyVips.includes(vipToken)) {
      const firstUsedKey = `start_time_${vipToken}`;
      const firstUsedAt = localStorage.getItem(firstUsedKey);

      if (!firstUsedAt) {
        // Első belépés rögzítése
        localStorage.setItem(firstUsedKey, Date.now().toString());
        return; 
      }

      // 7 napos lejárat ellenőrzése (604.800.000 ms)
      const limit = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(firstUsedAt) < limit) {
        return; 
      } else {
        // Ha lejárt, törlés és kidobás
        localStorage.removeItem("wai_vip_token");
        window.location.href = "/start";
        return;
      }
    }

    // 3. Ha nincs VIP kód, jön a Stripe ellenőrzés...
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
    return () => {
      cancelled = true;
    };
  }, []);

  /* ================= CORE STATE ================= */

  const [viewMode, setViewMode] = useState("executive");
  const [cycleDay, setCycleDay] = useState(1);

  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

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
      return JSON.parse(localStorage.getItem("weeklyFocus"));
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

  /* ================= SNAPSHOT AVAILABILITY ================= */

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

  /* ================= AI LOGIC ================= */

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
      localStorage.setItem("monthlyBriefings", JSON.stringify(stored.slice(-30)));
    }
  };

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
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

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
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const activeSnapshot = selectedDay ? getSnapshotByDay(selectedDay) : dailySnapshot;
  const activeDual = activeSnapshot || dailyDual;
  const activeText = activeDual && (viewMode === "executive" ? activeDual.executive : activeDual.directive);

  /* ================= EXPORT & EMAIL ================= */

  const getBriefings = (range) => {
    const legacy = JSON.parse(localStorage.getItem("monthlyBriefings")) || [];
    const snapshots = getMonthlySnapshots() || [];

    const combined = [...legacy];
    snapshots.forEach((s) => {
      if (!combined.find((b) => b.date === s.date)) {
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
      return alert("No saved data available for this range.");
    }

    const text = data
      .map(
        (b) =>
          `Day ${b.cycleDay} · ${b.date}\n\n${
            viewMode === "executive" ? b.executive : b.directive
          }`
      )
      .join("\n\n---------------------\n\n");

    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
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
    a.download = "wealthyai-monthly-briefing.pdf";
    a.click();
  };
   const confirmAndSendEmail = async () => {
    if (!userEmail) return alert("Please enter an email address.");
    setEmailSending(true);

    try {
      await fetch("/api/send-month-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: activeText, 
          cycleDay, 
          region,
          email: userEmail 
        }),
      });
      alert("Email sent successfully!");
      setEmailModalOpen(false);
    } catch (err) {
      alert("Failed to send email.");
    }
    setEmailSending(false);
  };

  const sendEmailPDF = async () => {
    if (!activeText) return;
    setEmailModalOpen(true);
  };

  /* ================= RENDER ================= */

  return (
    <div style={{ ...page, overflowX: isMobile ? "hidden" : undefined, backgroundAttachment: "fixed" }}>
      
      <WealthyTicker isMobile={isMobile} />

      <a href="/month/help" style={helpButton}>
        Help
      </a>

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
          {focusOpen
            ? "Close selection"
            : weeklyFocus
            ? "Change selection"
            : "What is this?"}
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
                    opacity: disabled || (hasSelection && !isSelected) ? 0.3 : 1,
                    cursor:
                      disabled || (hasSelection && !isSelected)
                        ? "not-allowed"
                        : "pointer",
                    background:
                      focusPreview === f.key || isSelected ? "#38bdf8" : "transparent",
                    color:
                      focusPreview === f.key || isSelected ? "#020617" : "#38bdf8",
                    marginBottom: 6,
                    display: "block",
                    width: "100%",
                  }}
                >
                  {f.label} {isSelected ? "✓" : ""}
                </button>
              );
            })}

            {focusPreview && !weeklyFocus && (
              <div style={{ marginTop: 10 }}>
                <p style={{ fontSize: 13, opacity: 0.7 }}>
                  You selected <strong>{focusPreview}</strong> for this week. This
                  cannot be changed later.
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
        <div style={card}>
          <h3>Monthly Financial Structure</h3>

          <Label>Income</Label>
          <Input value={inputs.income} onChange={(e) => update("income", e.target.value)} />

          <Divider />

          <Section title="Living">
            <Row
              label="Housing"
              value={inputs.housing}
              onChange={(v) => update("housing", v)}
            />
          </Section>

          <Section title="Utilities">
            <Row
              label="Electricity"
              value={inputs.electricity}
              onChange={(v) => update("electricity", v)}
            />
            <Row label="Gas" value={inputs.gas} onChange={(v) => update("gas", v)} />
            <Row label="Water" value={inputs.water} onChange={(v) => update("water", v)} />
          </Section>

          <Section title="Recurring Services">
            <Row
              label="Internet"
              value={inputs.internet}
              onChange={(v) => update("internet", v)}
            />
            <Row
              label="Mobile phone"
              value={inputs.mobile}
              onChange={(v) => update("mobile", v)}
            />
            <Row
              label="Insurance"
              value={inputs.insurance}
              onChange={(v) => update("insurance", v)}
            />
          </Section>

          <Divider />

          <div style={{ padding: "10px 0" }}>
            <strong style={{ color: "#10b981", fontSize: 13, display: "block", marginBottom: 10 }}>
                STRUCTURAL STRESS TEST
            </strong>
            <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={stressFactor} 
                onChange={(e) => { 
                    setStressFactor(parseFloat(e.target.value)); 
                    setSimulationActive(true); 
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

        <div style={card}>
          {!aiVisible && !simulationActive && (
            <div style={{ padding: "10px", animation: "fadeIn 0.8s ease-in" }}>
              <strong style={{ color: "#10b981", fontSize: 12, letterSpacing: 1 }}>
                WEALTHYAI PHILOSOPHY
              </strong>
              <h2 style={{ fontSize: 22, marginTop: 10 }}>Interpretation, Not Advice.</h2>
              <p style={{ opacity: 0.7, lineHeight: "1.6", fontSize: 14 }}>
                We built WealthyAI around a different question: What happens if AI doesn’t
                advise — but interprets? Not faster decisions, but{" "}
                <strong>clearer thinking</strong>.
              </p>
              <p
                style={{
                  opacity: 0.7,
                  lineHeight: "1.6",
                  fontSize: 14,
                  marginTop: 12,
                }}
              >
                Our system assumes that you remain responsible for decisions — it simply
                gives you a clearer frame to make them. WealthyAI doesn’t reward speed.
                It rewards <strong>attention</strong>.
              </p>
            </div>
          )}

          {simulationActive && !aiVisible && (
            <div style={{ padding: "10px", animation: "fadeIn 0.3s ease-out" }}>
              <strong style={{ color: "#10b981", fontSize: 12 }}>
                LIVE SIMULATION ENGINE
              </strong>
              <h2 style={{ fontSize: 20, marginTop: 5 }}>Structural Fragility Index</h2>
              
              <div style={{ fontSize: 42, fontWeight: "bold", color: "#38bdf8", margin: "15px 0" }}>
                {calculateFragility()}%
              </div>

              <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                <div 
                    style={{ 
                        height: "100%", 
                        width: `${calculateFragility()}%`, 
                        background: "linear-gradient(90deg, #10b981, #38bdf8)", 
                        transition: "width 0.3s ease" 
                    }} 
                />
              </div>

              <p style={{ opacity: 0.6, fontSize: 13, marginTop: 15, lineHeight: "1.5" }}>
                At <strong>{Math.round(stressFactor * 100)}%</strong> simulated pressure, 
                your core financial rigidity is 
                {parseFloat(calculateFragility()) > 55 
                    ? " approaching a critical threshold." 
                    : " currently within structural limits."}
              </p>

              <button 
                onClick={() => setSimulationActive(false)} 
                style={{ ...exportBtn, marginTop: 20, fontSize: 12, opacity: 0.6 }}
              >
                Reset view
              </button>
            </div>
          )}

          {aiVisible && (
            <div>
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
                  onClick={() => {
                    setAiVisible(false);
                    setSimulationActive(false);
                  }}
                  style={{ ...exportBtn, maxWidth: 44 }}
                >
                  ✕
                </button>
              </div>

              <pre style={aiTextStyle}>{activeText}</pre>

              {!selectedDay && (
                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    gap: 12,
                    flexWrap: isMobile ? "wrap" : "nowrap",
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
                  <button onClick={handleDownload} style={exportBtn}>
                    Download
                  </button>
                  <button onClick={downloadPDF} style={exportBtn}>
                    PDF
                  </button>
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
            style={{ ...exportBtn, width: "100%" }}
          >
            {archiveOpen ? "Hide past days" : "View past days"}
          </button>

          {archiveOpen && (
            <div style={{ marginTop: 10 }}>
              {getMonthlySnapshots().map((s) => (
                <button
                  key={s.date}
                  onClick={() => {
                    setSelectedDay(s.cycleDay);
                    setAiVisible(true);
                    setSimulationActive(false);
                  }}
                  style={{ ...exportBtn, marginBottom: 4, width: "100%" }}
                >
                  Day {s.cycleDay}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {emailModalOpen && (
        <div style={modalOverlay}>
          <div style={{ ...card, maxWidth: 400, width: "100%", position: "relative" }}>
            <h3>Send Briefing via Email</h3>
            <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 15 }}>
              Enter the email address where you'd like to receive the PDF report.
            </p>
            <input 
              type="email" 
              placeholder="your@email.com" 
              value={userEmail} 
              onChange={(e) => setUserEmail(e.target.value)} 
              style={{ ...input, marginBottom: 20, border: "1px solid #38bdf8" }} 
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEmailModalOpen(false)} style={exportBtn}>
                Cancel
              </button>
              <button onClick={confirmAndSendEmail} style={aiButton}>
                {emailSending ? "Sending..." : "Send Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={footer}>© 2026 WealthyAI · Monthly Intelligence</div>

      <style>{`
        @keyframes waiScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ================= UI HELPERS & STYLES ================= */

const Section = ({ title, children }) => (
  <>
    <Divider />
    <strong style={{ fontSize: 14, color: "#7dd3fc" }}>{title}</strong>
    {children}
  </>
);

const Row = ({ label, value, onChange }) => (
  <div style={row}>
    <span style={{ fontSize: 13, opacity: 0.8 }}>{label}</span>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={rowInput}
    />
  </div>
);

const Label = ({ children }) => (
  <label style={{ marginBottom: 6, display: "block", fontSize: 13, opacity: 0.8 }}>
    {children}
  </label>
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
  backgroundImage: `
    repeating-linear-gradient(-25deg, rgba(56,189,248,0.04) 0px, rgba(56,189,248,0.04) 1px, transparent 1px, transparent 180px),
    repeating-linear-gradient(35deg, rgba(167,139,250,0.04) 0px, rgba(167,139,250,0.04) 1px, transparent 1px, transparent 260px),
    radial-gradient(circle at 20% 30%, rgba(56,189,248,0.14), transparent 45%),
    radial-gradient(circle at 80% 60%, rgba(167,139,250,0.14), transparent 50%),
    url("/wealthyai/icons/generated.png")
  `,
  backgroundRepeat: "repeat, repeat, no-repeat, no-repeat, repeat",
  backgroundSize: "auto, auto, 100% 100%, 100% 100%, 420px auto",
};

const header = { textAlign: "center", marginBottom: 20 };
const title = { fontSize: "2rem", margin: 0 };
const subtitle = { marginTop: 8, color: "#cbd5f5", fontSize: 14, letterSpacing: "0.05em" };

const helpButton = {
  position: "absolute",
  top: 20,
  right: 20,
  padding: "6px 12px",
  borderRadius: 8,
  fontSize: 12,
  textDecoration: "none",
  color: "#7dd3fc",
  border: "1px solid #1e293b",
  background: "rgba(2,6,23,0.7)",
};

const regionRow = {
  display: "flex",
  justifyContent: "center",
  gap: 10,
  marginBottom: 20,
};

const regionLabel = { color: "#7dd3fc", fontSize: 14 };

const regionSelect = {
  background: "#020617",
  color: "#e5e7eb",
  border: "1px solid #1e293b",
  padding: "4px 8px",
  borderRadius: 6,
};

const signalBox = {
  maxWidth: 800,
  margin: "0 auto 15px",
  padding: 14,
  border: "1px solid #1e293b",
  borderRadius: 12,
  background: "rgba(2,6,23,0.75)",
};

const layout = {
  display: "grid",
  gridTemplateColumns: "1fr 1.3fr",
  gap: 25,
  maxWidth: 1100,
  margin: "0 auto",
};

const card = {
  padding: 20,
  borderRadius: 16,
  border: "1px solid #1e293b",
  background: "rgba(2,6,23,0.78)",
};

const input = {
  width: "100%",
  padding: 10,
  marginTop: 4,
  background: "rgba(255,255,255,0.08)",
  border: "none",
  borderRadius: 8,
  color: "white",
};

const row = { display: "flex", justifyContent: "space-between", marginTop: 6 };

const rowInput = {
  width: 80,
  background: "transparent",
  border: "none",
  borderBottom: "1px solid #38bdf8",
  color: "#38bdf8",
  textAlign: "right",
};

const aiButton = {
  marginTop: 20,
  width: "100%",
  padding: 12,
  background: "#38bdf8",
  border: "none",
  borderRadius: 10,
  fontWeight: "bold",
  cursor: "pointer",
  color: "#020617",
};

const aiTextStyle = {
  marginTop: 10,
  whiteSpace: "pre-wrap",
  color: "#cbd5f5",
  fontSize: 14,
  lineHeight: "1.6",
};

const exportBtn = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #1e293b",
  background: "transparent",
  color: "#38bdf8",
  cursor: "pointer",
  fontSize: 13,
};

const exportSelect = {
  background: "transparent",
  color: "#e5e7eb",
  border: "1px solid #1e293b",
  padding: "8px",
  borderRadius: 8,
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 20,
};

const footer = {
  marginTop: 40,
  textAlign: "center",
  fontSize: 12,
  color: "#64748b",
  paddingBottom: 20,
};
