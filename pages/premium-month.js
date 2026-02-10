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
    const energy = (inputs.electricity + inputs.gas) * (1 + stressFactor);
    const fixed = inputs.housing + inputs.insurance + inputs.banking + energy;
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
    return () => {
      cancelled = true;
    };
  }, []);

  /* ================= CORE STATE ================= */

  const [viewMode, setViewMode] = useState("executive");
  const [cycleDay, setCycleDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  /* ================= EMAIL MODAL STATE ================= */
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  /* ================= AI PANEL STATE ================= */

  const [aiVisible, setAiVisible] = useState(false);
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

  /* ================= AI LOGIC ================= */

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
    } catch {}
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
    } catch {}
    setLoading(false);
  };

  /* ================= EXPORT & EMAIL ================= */

  const activeSnapshot = selectedDay
    ? getSnapshotByDay(selectedDay)
    : dailySnapshot;

  const activeDual = activeSnapshot || dailyDual;

  const activeText =
    activeDual &&
    (viewMode === "executive" ? activeDual.executive : activeDual.directive);

  const downloadPDF = async () => {
    if (!activeText) return;
    const res = await fetch("/api/export-month-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: activeText, cycleDay, region }),
    });
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = "wealthyai-monthly-briefing.pdf";
    a.click();
  };

  const sendEmailPDF = () => {
    if (!activeText) return;
    setEmailModalOpen(true);
  };

  const confirmAndSendEmail = async () => {
    if (!userEmail || !userEmail.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    setEmailSending(true);
    try {
      const response = await fetch("/api/send-month-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: activeText,
          cycleDay,
          region,
          email: userEmail,
        }),
      });
      if (response.ok) {
        alert("Strategy sent to: " + userEmail);
        setEmailModalOpen(false);
      } else {
        alert("Error sending report.");
      }
    } catch (err) {
      alert("Failed to connect to the server.");
    }
    setEmailSending(false);
  };

  /* ================= MAIN RENDER ================= */

  return (
    <div
      style={{
        ...page,
        overflowX: isMobile ? "hidden" : undefined,
        backgroundAttachment: "fixed",
      }}
    >
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
            : "Choose one focus area for this week."}
        </p>
        <button onClick={() => setFocusOpen(!focusOpen)} style={exportBtn}>
          {focusOpen ? "Close" : "Change focus"}
        </button>

        {focusOpen && (
          <div style={{ marginTop: 12 }}>
            {FOCUS_OPTIONS.map((f, i) => {
              const isSelected = weeklyFocus?.key === f.key;
              const disabled = i < getCurrentWeekIndex();
              return (
                <button
                  key={f.key}
                  disabled={disabled || (weeklyFocus && !isSelected)}
                  onClick={() => setFocusPreview(f.key)}
                  style={{
                    ...exportBtn,
                    opacity: disabled || (weeklyFocus && !isSelected) ? 0.3 : 1,
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
              <button onClick={confirmWeeklyFocus} style={aiButton}>
                Confirm {focusPreview}
              </button>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          ...layout,
          gridTemplateColumns: isMobile ? "1fr" : layout.gridTemplateColumns,
        }}
      >
        {/* LEFT COLUMN */}
        <div style={card}>
          <h3>Financial Structure</h3>
          <Label>Income</Label>
          <Input value={inputs.income} onChange={(e) => update("income", e.target.value)} />
          <Divider />
          <Section title="Living">
            <Row label="Housing" value={inputs.housing} onChange={(v) => update("housing", v)} />
          </Section>
          <Section title="Utilities">
            <Row label="Electricity" value={inputs.electricity} onChange={(v) => update("electricity", v)} />
            <Row label="Gas" value={inputs.gas} onChange={(v) => update("gas", v)} />
          </Section>
          <Divider />
          <div style={{ padding: "10px 0" }}>
            <strong style={{ color: "#10b981", fontSize: 13, display: "block", marginBottom: 10 }}>STRESS TEST</strong>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={stressFactor}
              onChange={(e) => { setStressFactor(parseFloat(e.target.value)); setSimulationActive(true); }}
              style={{ width: "100%", accentColor: "#10b981" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
            <button onClick={() => { setSimulationActive(true); setAiVisible(false); }} style={exportBtn}>SIMULATE</button>
            <button onClick={runAI} style={{ ...aiButton, marginTop: 0 }}>{loading ? "..." : "GENERATE AI"}</button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={card}>
          {simulationActive && !aiVisible && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <strong style={{ color: "#10b981" }}>FRAGILITY INDEX</strong>
              <div style={{ fontSize: 48, fontWeight: "bold", color: "#38bdf8" }}>{calculateFragility()}%</div>
            </div>
          )}
          {aiVisible && (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <button onClick={() => setViewMode("executive")} style={exportBtn}>Executive</button>
                <button onClick={() => setViewMode("directive")} style={exportBtn}>Directive</button>
              </div>
              <pre style={aiTextStyle}>{activeText}</pre>
              <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                <button onClick={downloadPDF} style={exportBtn}>PDF</button>
                <button onClick={sendEmailPDF} style={exportBtn}>Email</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= JAVÍTOTT MODAL OVERLAY ================= */}
      {emailModalOpen && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ marginTop: 0, color: "#fff" }}>Send Report</h3>
            <p style={{ fontSize: 13, opacity: 0.7 }}>Enter your email address:</p>
            <input
              type="email"
              placeholder="name@email.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              style={modalInput}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setEmailModalOpen(false)} style={exportBtn}>Cancel</button>
              <button onClick={confirmAndSendEmail} style={{ ...aiButton, marginTop: 0 }}>
                {emailSending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={footer}>© 2026 WealthyAI</div>
    </div>
  );
}
/* ================= HELPER COMPONENTS ================= */

const Section = ({ title, children }) => (
  <>
    <Divider />
    <strong style={{ fontSize: 14, color: "#7dd3fc", letterSpacing: 0.5 }}>
      {title}
    </strong>
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
  <label
    style={{
      marginBottom: 6,
      display: "block",
      fontSize: 13,
      opacity: 0.8,
      fontWeight: 500,
    }}
  >
    {children}
  </label>
);

const Input = ({ value, onChange }) => (
  <input type="number" value={value} onChange={onChange} style={input} />
);

const Divider = () => (
  <div
    style={{
      height: 1,
      background: "linear-gradient(90deg, #1e293b, transparent)",
      margin: "16px 0",
    }}
  />
);

/* ================= DETAILED STYLES ================= */

const page = {
  minHeight: "100vh",
  position: "relative",
  padding: "40px 20px",
  color: "#e5e7eb",
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  backgroundColor: "#020617",
  backgroundImage: `
    radial-gradient(circle at 20% 30%, rgba(56, 189, 248, 0.12), transparent 45%),
    radial-gradient(circle at 80% 60%, rgba(167, 139, 250, 0.12), transparent 50%)
  `,
};

const header = {
  textAlign: "center",
  marginBottom: 40,
};

const title = {
  fontSize: "1.8rem",
  fontWeight: "800",
  letterSpacing: "-0.02em",
  margin: 0,
  background: "linear-gradient(to right, #fff, #94a3b8)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const subtitle = {
  marginTop: 8,
  color: "#94a3b8",
  fontSize: 14,
  fontWeight: "400",
};

const helpButton = {
  position: "absolute",
  top: 20,
  right: 20,
  padding: "6px 14px",
  borderRadius: "100px",
  fontSize: 11,
  fontWeight: "600",
  textDecoration: "none",
  color: "#7dd3fc",
  border: "1px solid rgba(125, 211, 252, 0.2)",
  background: "rgba(15, 23, 42, 0.6)",
  backdropFilter: "blur(4px)",
};

const regionRow = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 12,
  marginBottom: 30,
};

const regionLabel = {
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: 1,
};

const regionSelect = {
  background: "#0f172a",
  color: "#e5e7eb",
  border: "1px solid #1e293b",
  padding: "6px 12px",
  borderRadius: 8,
  fontSize: 13,
  outline: "none",
  cursor: "pointer",
};

const signalBox = {
  maxWidth: 800,
  margin: "0 auto 16px",
  padding: "16px 20px",
  border: "1px solid rgba(30, 41, 59, 0.5)",
  borderRadius: 16,
  background: "rgba(15, 23, 42, 0.4)",
  backdropFilter: "blur(8px)",
};

const layout = {
  display: "grid",
  gridTemplateColumns: "1fr 1.4fr",
  gap: 30,
  maxWidth: 1100,
  margin: "0 auto",
};

const card = {
  padding: 24,
  borderRadius: 24,
  border: "1px solid rgba(30, 41, 59, 0.7)",
  background: "rgba(15, 23, 42, 0.6)",
  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
};

const input = {
  width: "100%",
  padding: "12px 16px",
  marginTop: 4,
  background: "rgba(2, 6, 23, 0.5)",
  border: "1px solid #1e293b",
  borderRadius: 12,
  color: "#fff",
  fontSize: 15,
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 10,
};

const rowInput = {
  width: 90,
  background: "transparent",
  border: "none",
  borderBottom: "1px solid rgba(56, 189, 248, 0.3)",
  color: "#38bdf8",
  textAlign: "right",
  fontSize: 14,
  fontWeight: "600",
  padding: "2px 4px",
  outline: "none",
};

const aiButton = {
  marginTop: 20,
  width: "100%",
  padding: "14px",
  background: "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
  border: "none",
  borderRadius: 14,
  fontWeight: "700",
  fontSize: 14,
  cursor: "pointer",
  color: "#020617",
};

const aiTextStyle = {
  marginTop: 20,
  whiteSpace: "pre-wrap",
  color: "#cbd5e1",
  fontSize: 14,
  lineHeight: "1.7",
};

const exportBtn = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid #1e293b",
  background: "rgba(30, 41, 59, 0.2)",
  color: "#38bdf8",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: "600",
};

const footer = {
  marginTop: 60,
  textAlign: "center",
  fontSize: 11,
  color: "#475569",
  paddingBottom: 40,
};

/* ================= MODAL SPECIFIC STYLES ================= */

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.85)", // Erős sötétített háttér
  backdropFilter: "blur(10px)", // Homályosítás az overlay mögött
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999, // Hogy minden felett legyen
};

const modalContent = {
  padding: 30,
  borderRadius: 24,
  border: "1px solid #38bdf8",
  background: "#0f172a", // Sötétkék háttér a tartalomnak
  maxWidth: 400,
  width: "90%",
  boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
};

const modalInput = {
  width: "100%",
  padding: "14px",
  marginTop: 15,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid #1e293b",
  borderRadius: 12,
  color: "#fff",
  fontSize: 15,
  outline: "none",
};
  const [aiCollapsed, setAiCollapsed] = useState(true);
