import { useState, useEffect } from "react";
import {
  saveMonthlySnapshot,
  getMonthlySnapshots,
  getSnapshotByDay,
} from "../lib/monthlyArchive";

const REGIONS = [
  { code: "US", label: "United States" },
  { code: "EU", label: "European Union" },
  { code: "UK", label: "United Kingdom" },
  { code: "HU", label: "Hungary" },
];

export default function PremiumMonth() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return (window.location.href = "/start");

    fetch("/api/verify-active-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(r => r.json())
      .then(d => !d.valid && (window.location.href = "/start"))
      .catch(() => (window.location.href = "/start"));
  }, []);

  const [region, setRegion] = useState("EU");
  const [analysisMode, setAnalysisMode] = useState("executive");
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiCollapsed, setAiCollapsed] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [exportRange, setExportRange] = useState("day");
  const [cycleDay, setCycleDay] = useState(1);

  /* ===== SNAPSHOT / ARCHIVE ADDITIONS ===== */
  const [dailySnapshot, setDailySnapshot] = useState(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [viewMode, setViewMode] = useState("executive");

  /* ===== DAILY AVAILABILITY ===== */
  const [isTodayAvailable, setIsTodayAvailable] = useState(false);

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

  const update = (k, v) => setInputs({ ...inputs, [k]: Number(v) });

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

  /* ===== DAILY RANDOM AVAILABILITY ===== */
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
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

    const checkAvailability = () => {
      if (Date.now() >= Number(availableAt)) {
        setIsTodayAvailable(true);
      }
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 60 * 1000);
    return () => clearInterval(interval);
  }, [cycleDay]);

  /* ===== LEGACY BRIEFING STORAGE (UNCHANGED) ===== */
  const saveBriefing = text => {
    const today = new Date().toISOString().slice(0, 10);
    const stored = JSON.parse(localStorage.getItem("monthlyBriefings")) || [];
    if (!stored.find(b => b.date === today && b.analysisMode === analysisMode)) {
      stored.push({ id: Date.now(), date: today, cycleDay, analysisMode, text });
      localStorage.setItem("monthlyBriefings", JSON.stringify(stored.slice(-30)));
    }
  };

  const getBriefings = range => {
    const stored = JSON.parse(localStorage.getItem("monthlyBriefings")) || [];
    if (range === "day") {
      const today = new Date().toISOString().slice(0, 10);
      return stored.filter(b => b.date === today);
    }
    if (range === "week") return stored.slice(-7);
    if (range === "month") return stored;
    return [];
  };

  /* ===== ORIGINAL runAI (UNCHANGED) ===== */
  const runAI = async () => {
    setLoading(true);
    setAiOpen(true);
    setAiCollapsed(false);

    try {
      const res = await fetch("/api/get-ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          cycleDay,
          analysisMode,
          previousSignals: JSON.parse(
            localStorage.getItem("monthlySignals") || "[]"
          ).join("\n"),
          ...inputs,
        }),
      });

      const json = await res.json();
      let text = json.briefing || "";
      if (text.includes("--- INTERNAL SIGNALS ---"))
        text = text.split("--- INTERNAL SIGNALS ---")[0].trim();

      setAiText(text || "AI briefing unavailable.");
      saveBriefing(text);
    } catch {
      setAiText("AI system temporarily unavailable.");
    }
    setLoading(false);
  };

  /* ===== NEW SNAPSHOT AI (ADDITIVE) ===== */
  const runAIDual = async () => {
    if (!isTodayAvailable) {
      alert("Today's briefing is not available yet.");
      return;
    }

    setLoading(true);
    setAiOpen(true);
    setAiCollapsed(false);
    setSelectedDay(null);

    try {
      const res = await fetch("/api/get-ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          cycleDay,
          previousSignals: "",
          ...inputs,
        }),
      });

      const data = await res.json();
      if (data?.snapshot) {
        saveMonthlySnapshot(data.snapshot);
        setDailySnapshot(data.snapshot);
      }
    } catch {
      setAiText("AI system temporarily unavailable.");
    }

    setLoading(false);
  };

  const activeSnapshot = selectedDay
    ? getSnapshotByDay(selectedDay)
    : dailySnapshot;

  const activeText =
    activeSnapshot &&
    (viewMode === "executive"
      ? activeSnapshot.executive
      : activeSnapshot.directive);

  /* ===== EXPORT HELPERS (UNCHANGED) ===== */
  const handleDownload = () => {
    const data = getBriefings(exportRange);
    if (!data.length) return alert("No data available.");
    const text = data
      .map(b => `Day ${b.cycleDay} · ${b.date}\n\n${b.text}`)
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
    if (!aiText) return alert("No AI briefing available.");
    const res = await fetch("/api/export-month-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: aiText, cycleDay, region }),
    });
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = "wealthyai-monthly-briefing.pdf";
    a.click();
  };

  const sendEmailPDF = async () => {
    if (!aiText) return alert("No AI briefing available.");
    setEmailSending(true);
    try {
      await fetch("/api/send-month-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText, cycleDay, region }),
      });
      alert("Email sent successfully.");
    } catch {
      alert("Email sending failed.");
    }
    setEmailSending(false);
  };

  return (
    <div style={page}>
      <a href="/month/help" style={helpButton}>Help</a>

      <div style={header}>
        <h1 style={title}>WEALTHYAI · MONTHLY BRIEFING</h1>
        <p style={subtitle}>Strategic financial outlook · Next 90 days</p>
      </div>

      <div style={regionRow}>
        <span style={regionLabel}>Region</span>
        <select value={region} onChange={e => setRegion(e.target.value)} style={regionSelect}>
          {REGIONS.map(r => (
            <option key={r.code} value={r.code}>{r.label}</option>
          ))}
        </select>
      </div>

      <div style={signalBox}>
        <strong>Cycle Status</strong>
        <p>Day {cycleDay} of your current monthly cycle.</p>
      </div>

      <div style={layout}>
        <div style={card}>
          <h3>Monthly Financial Structure</h3>

          <Label>Income</Label>
          <Input value={inputs.income} onChange={e => update("income", e.target.value)} />
          <Divider />

          <Section title="Living">
            <Row label="Housing" value={inputs.housing} onChange={v => update("housing", v)} />
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
          </Section>

          <Section title="Irregular">
            <Row label="Unexpected" value={inputs.unexpected} onChange={v => update("unexpected", v)} />
            <Row label="Other" value={inputs.other} onChange={v => update("other", v)} />
          </Section>

          <button onClick={runAIDual} style={aiButton}>
            {loading ? "Generating briefing…" : "Generate Monthly Briefing"}
          </button>
        </div>

        <div style={card}>
          <button onClick={() => setArchiveOpen(!archiveOpen)} style={{ marginBottom: 10 }}>
            {archiveOpen ? "Hide archive" : "View past days"}
          </button>

          {archiveOpen && (
            <div style={{ marginBottom: 16 }}>
              {getMonthlySnapshots().map(s => (
                <button
                  key={s.date}
                  onClick={() => setSelectedDay(s.cycleDay)}
                  style={{ marginRight: 6 }}
                >
                  Day {s.cycleDay}
                </button>
              ))}
            </div>
          )}

          {activeSnapshot && (
            <div style={{ marginBottom: 10 }}>
              <button onClick={() => setViewMode("executive")}>Executive</button>
              <button onClick={() => setViewMode("directive")}>Directive</button>
            </div>
          )}

          {!isTodayAvailable && !selectedDay && (
            <p style={{ opacity: 0.7 }}>Today’s briefing is not available yet.</p>
          )}

          {activeText && <pre style={aiTextStyle}>{activeText}</pre>}

          {!selectedDay && aiText && (
            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
              <select
                value={exportRange}
                onChange={e => setExportRange(e.target.value)}
                style={exportSelect}
              >
                <option value="day">Today</option>
                <option value="week">Last 7 days</option>
                <option value="month">This month</option>
              </select>

              <button onClick={handleDownload} style={exportBtn}>Download</button>
              <button onClick={downloadPDF} style={exportBtn}>Download PDF</button>
              <button onClick={sendEmailPDF} style={exportBtn}>
                {emailSending ? "Sending…" : "Send by Email"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={footer}>© 2026 WealthyAI · Monthly Intelligence</div>
    </div>
  );
}

/* UI HELPERS */

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
  <input
    type="number"
    value={value}
    onChange={onChange}
    style={input}
  />
);

const Divider = () => (
  <div style={{ height: 1, background: "#1e293b", margin: "16px 0" }} />
);

/* STYLES — UNCHANGED */

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
  backgroundRepeat: "repeat, repeat, no-repeat, no-repeat, no-repeat, repeat",
  backgroundSize: "auto, auto, 100% 100%, 100% 100%, 100% 100%, 420px auto",
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
  margin: "0 auto 30px",
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
