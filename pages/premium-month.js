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

  /* === MOBILE ADDITION: MOBILE DETECTION ONLY === */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  /* === END MOBILE ADDITION === */

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
    setFocusOpen(false);
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

    // input változás → minden AI reset
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
      const randomOffsetMs =
        Math.floor(Math.random() * 6 * 60 * 60 * 1000);
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

  const saveBriefing = dual => {
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
      localStorage.setItem(
        "monthlyBriefings",
        JSON.stringify(stored.slice(-30))
      );
    }
  };

  /* ================= DAILY AI ================= */

  const runAI = async () => {
    setLoading(true);
    setSelectedDay(null);

    try {
      const res = await fetch("/api/get-ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          country,
          cycleDay,
          previousSignals: "",
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

  /* ================= SNAPSHOT AI ================= */

  const runAIDual = async () => {
    if (!isTodayAvailable) {
      alert("Today's snapshot is not available yet.");
      return;
    }

    setLoading(true);
    setSelectedDay(null);

    try {
      const res = await fetch("/api/get-ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          country,
          cycleDay,
          previousSignals: "",
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

  /* ================= EXPORT ================= */

  const getBriefings = range => {
    const stored = JSON.parse(localStorage.getItem("monthlyBriefings")) || [];
    if (range === "day") {
      const today = getTodayKey();
      return stored.filter(b => b.date === today);
    }
    if (range === "week") return stored.slice(-7);
    if (range === "month") return stored;
    return [];
  };

  const handleDownload = () => {
    const data = getBriefings(exportRange);
    if (!data.length) return alert("No data available.");

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
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = "wealthyai-monthly-briefing.pdf";
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
    } catch {}
    setEmailSending(false);
  };

  /* ================= RENDER ================= */

  return (
    <div
      style={{
        ...page,
        overflowX: isMobile ? "hidden" : undefined, // === MOBILE ADDITION ===
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
          <p style={{ opacity: 0.7 }}>Today’s signal is still forming.</p>
        ) : (
          <p>{dailySignal}</p>
        )}
      </div>

      <div style={signalBox}>
        <strong>Weekly focus</strong>
        {/* … TARTALOM VÁLTOZATLANUL JÖN TOVÁBB … */}
      </div>

      {/* === MOBILE STACK: INPUT + AI EGYMÁS ALÁ === */}
      <div
        style={{
          ...layout,
          gridTemplateColumns: isMobile ? "1fr" : layout.gridTemplateColumns, // === MOBILE ADDITION ===
          gap: isMobile ? 20 : layout.gap, // === MOBILE ADDITION ===
        }}
      >
        {/* LEFT COLUMN */}
        <div style={card}>
          <h3>Monthly Financial Structure</h3>

          <Label>Income</Label>
          <Input
            value={inputs.income}
            onChange={e => update("income", e.target.value)}
          />
          <Divider />

          <Section title="Living">
            <Row
              label="Housing"
              value={inputs.housing}
              onChange={v => update("housing", v)}
            />
          </Section>

          <Section title="Utilities">
            <Row
              label="Electricity"
              value={inputs.electricity}
              onChange={v => update("electricity", v)}
            />
            <Row
              label="Gas"
              value={inputs.gas}
              onChange={v => update("gas", v)}
            />
            <Row
              label="Water"
              value={inputs.water}
              onChange={v => update("water", v)}
            />
          </Section>

          <Section title="Recurring Services">
            <Row
              label="Internet"
              value={inputs.internet}
              onChange={v => update("internet", v)}
            />
            <Row
              label="Mobile phone"
              value={inputs.mobile}
              onChange={v => update("mobile", v)}
            />
            <Row
              label="TV / Streaming"
              value={inputs.tv}
              onChange={v => update("tv", v)}
            />
            <Row
              label="Insurance"
              value={inputs.insurance}
              onChange={v => update("insurance", v)}
            />
            <Row
              label="Banking fees"
              value={inputs.banking}
              onChange={v => update("banking", v)}
            />
          </Section>

          <Section title="Irregular">
            <Row
              label="Unexpected"
              value={inputs.unexpected}
              onChange={v => update("unexpected", v)}
            />
            <Row
              label="Other"
              value={inputs.other}
              onChange={v => update("other", v)}
            />
          </Section>

          <button onClick={runAI} style={aiButton}>
            {loading ? "Generating briefing…" : "Generate Monthly Briefing"}
          </button>

          <button
            onClick={runAIDual}
            style={{ ...exportBtn, marginTop: 12 }}
          >
            Save Today’s Snapshot
          </button>
        </div>

        {/* RIGHT COLUMN */}
        <div
          style={{
            ...card,
            marginTop: isMobile ? 12 : undefined, // === MOBILE ADDITION ===
          }}
        >
          <button
            onClick={() => setArchiveOpen(!archiveOpen)}
            style={{ ...exportBtn, marginBottom: 10 }}
          >
            {archiveOpen ? "Hide past days" : "View past days"}
          </button>

          {archiveOpen && (
            <div style={{ marginBottom: 16 }}>
              {getMonthlySnapshots().length === 0 ? (
                <p style={{ opacity: 0.6, fontSize: 14 }}>
                  No snapshots saved yet.
                </p>
              ) : (
                getMonthlySnapshots().map(s => (
                  <button
                    key={s.date}
                    onClick={() => setSelectedDay(s.cycleDay)}
                    style={exportBtn}
                  >
                    Day {s.cycleDay}
                  </button>
                ))
              )}
            </div>
          )}

          {aiVisible && (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <button
                  onClick={() => setAiCollapsed(!aiCollapsed)}
                  style={exportBtn}
                >
                  {aiCollapsed ? "Show briefing" : "Hide briefing"}
                </button>

                <button
                  onClick={() => setAiCollapsed(true)}
                  style={{ ...exportBtn, maxWidth: 44 }}
                >
                  ✕
                </button>
              </div>

              {!aiCollapsed && activeDual && (
                <>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <button
                      onClick={() => setViewMode("executive")}
                      style={{
                        ...exportBtn,
                        background:
                          viewMode === "executive" ? "#38bdf8" : "transparent",
                        color:
                          viewMode === "executive"
                            ? "#020617"
                            : "#38bdf8",
                      }}
                    >
                      Executive
                    </button>

                    <button
                      onClick={() => setViewMode("directive")}
                      style={{
                        ...exportBtn,
                        background:
                          viewMode === "directive" ? "#38bdf8" : "transparent",
                        color:
                          viewMode === "directive"
                            ? "#020617"
                            : "#38bdf8",
                      }}
                    >
                      Directive
                    </button>
                  </div>

                  <pre style={aiTextStyle}>{activeText}</pre>

                  {!selectedDay && (
                    <div
                      style={{
                        marginTop: 16,
                        display: "flex",
                        gap: 12,
                        flexWrap: isMobile ? "wrap" : "nowrap", // === MOBILE ADDITION ===
                      }}
                    >
                      <select
                        value={exportRange}
                        onChange={e => setExportRange(e.target.value)}
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
                        Download PDF
                      </button>
                      <button onClick={sendEmailPDF} style={exportBtn}>
                        {emailSending ? "Sending…" : "Send by Email"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={footer}>© 2026 WealthyAI · Monthly Intelligence</div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

const Section = ({ title, children }) => (
  <>
    <Divider />
    <strong>{title}</strong>
    {children}
  </>
);

const Row = ({ label, value, onChange }) => (
  <div style={row}>
    <span>{label}</span>
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={rowInput}
    />
  </div>
);

const Label = ({ children }) => (
  <label style={{ marginBottom: 6, display: "block" }}>{children}</label>
);

const Input = ({ value, onChange }) => (
  <input type="number" value={value} onChange={onChange} style={input} />
);

const Divider = () => (
  <div style={{ height: 1, background: "#1e293b", margin: "16px 0" }} />
);

/* ================= STYLES ================= */

const page = {
  minHeight: "100vh",
  position: "relative",
  padding: 40,
  color: "#e5e7eb",
  fontFamily: "Inter, system-ui",
  backgroundColor: "#020617",
  backgroundImage: `
    repeating-linear-gradient(-25deg, rgba(56,189,248,0.04) 0px, rgba(56,189,248,0.04) 1px, transparent 1px, transparent 180px),
    repeating-linear-gradient(35deg, rgba(167,139,250,0.04) 0px, rgba(167,139,250,0.04) 1px, transparent 1px, transparent 260px),
    radial-gradient(circle at 20% 30%, rgba(56,189,248,0.14), transparent 45%),
    radial-gradient(circle at 80% 60%, rgba(167,139,250,0.14), transparent 50%),
    radial-gradient(circle at 45% 85%, rgba(34,211,238,0.10), transparent 45%),
    url("/wealthyai/icons/generated.png")
  `,
  backgroundRepeat:
    "repeat, repeat, no-repeat, no-repeat, no-repeat, repeat",
  backgroundSize:
    "auto, auto, 100% 100%, 100% 100%, 100% 100%, 420px auto",
};

const header = { textAlign: "center", marginBottom: 20 };
const title = { fontSize: "2.4rem", margin: 0 };
const subtitle = { marginTop: 8, color: "#cbd5f5" };

const helpButton = {
  position: "absolute",
  top: 24,
  right: 24,
  padding: "8px 14px",
  borderRadius: 10,
  fontSize: 13,
  textDecoration: "none",
  color: "#7dd3fc",
  border: "1px solid #1e293b",
  background: "rgba(2,6,23,0.7)",
  backdropFilter: "blur(6px)",
};

const regionRow = {
  display: "flex",
  justifyContent: "center",
  gap: 10,
  marginBottom: 20,
};

const regionLabel = { color: "#7dd3fc" };

const regionSelect = {
  background: "#020617",
  color: "#e5e7eb",
  border: "1px solid #1e293b",
  padding: "6px 10px",
  borderRadius: 6,
};

const signalBox = {
  maxWidth: 800,
  margin: "0 auto 20px",
  padding: 16,
  border: "1px solid #1e293b",
  borderRadius: 12,
  background: "rgba(2,6,23,0.75)",
};

const layout = {
  display: "grid",
  gridTemplateColumns: "1fr 1.3fr",
  gap: 30,
  maxWidth: 1100,
  margin: "0 auto",
};

const card = {
  padding: 22,
  borderRadius: 16,
  border: "1px solid #1e293b",
  background: "rgba(2,6,23,0.78)",
};

const input = {
  width: "100%",
  padding: 10,
  marginTop: 6,
  background: "rgba(255,255,255,0.08)",
  border: "none",
  borderRadius: 8,
  color: "white",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 8,
};

const rowInput = {
  width: 100,
  background: "transparent",
  border: "none",
  borderBottom: "1px solid #38bdf8",
  color: "#38bdf8",
  textAlign: "right",
};

const aiButton = {
  marginTop: 20,
  width: "100%",
  padding: 14,
  background: "#38bdf8",
  border: "none",
  borderRadius: 10,
  fontWeight: "bold",
  cursor: "pointer",
};

const aiTextStyle = {
  marginTop: 10,
  whiteSpace: "pre-wrap",
  color: "#cbd5f5",
};

const exportBtn = {
  flex: 1,
  padding: "10px",
  borderRadius: 8,
  border: "1px solid #1e293b",
  background: "transparent",
  color: "#38bdf8",
  cursor: "pointer",
};

const exportSelect = {
  flex: 1,
  background: "transparent",
  color: "#e5e7eb",
  border: "1px solid #1e293b",
  padding: "8px",
  borderRadius: 8,
};

const footer = {
  marginTop: 60,
  textAlign: "center",
  fontSize: 13,
  color: "#64748b",
};
