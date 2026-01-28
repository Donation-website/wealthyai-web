import { useState, useEffect } from "react";

/* ===== REGIONS ===== */
const REGIONS = [
  { code: "US", label: "United States" },
  { code: "EU", label: "European Union" },
  { code: "UK", label: "United Kingdom" },
  { code: "HU", label: "Hungary" },
];

export default function PremiumMonth() {
  const [region, setRegion] = useState("EU");

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

  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  /* ===== DUAL MODE STATE ===== */
  const [analysisMode, setAnalysisMode] = useState("executive");

  /* ===== AI BOX COLLAPSE STATE ===== */
  const [aiCollapsed, setAiCollapsed] = useState(false);

  const update = (k, v) =>
    setInputs({ ...inputs, [k]: Number(v) });

  /* ===== CYCLE DAY (RETENTION BASE + STRIPE READY) ===== */
  const [cycleDay, setCycleDay] = useState(1);

  useEffect(() => {
    // később Stripe subscription.current_period_start ide köthető
    const stripeStart = localStorage.getItem("subscriptionPeriodStart");
    const localStart = localStorage.getItem("monthCycleStart");
    const start = stripeStart || localStart;

    if (!start) {
      const now = Date.now();
      localStorage.setItem("monthCycleStart", now.toString());
      setCycleDay(1);
    } else {
      const diffDays = Math.floor(
        (Date.now() - Number(start)) / (1000 * 60 * 60 * 24)
      );
      setCycleDay(Math.min(diffDays + 1, 30));
    }
  }, []);

  /* ===== RUN AI (WITH MULTI-MONTH MEMORY) ===== */
  const runAI = async () => {
    setLoading(true);
    setAiOpen(true);
    setAiCollapsed(false);

    const previousSignals = JSON.parse(
      localStorage.getItem("monthlySignals") || "[]"
    ).join("\n");

    try {
      const res = await fetch("/api/get-ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          cycleDay,
          analysisMode,
          previousSignals,
          ...inputs,
        }),
      });

      const data = await res.json();
      const fullText = data.briefing || "AI briefing unavailable.";

      /* ===== MEMORY EXTRACTION ===== */
      const marker = "--- INTERNAL SIGNALS ---";
      if (fullText.includes(marker)) {
        const parts = fullText.split(marker);

        const visibleText = parts[0].trim();
        const signalLines = parts[1]
          .split("\n")
          .map(l => l.replace("-", "").trim())
          .filter(Boolean)
          .slice(0, 3);

        if (signalLines.length) {
          localStorage.setItem(
            "monthlySignals",
            JSON.stringify(signalLines)
          );
        }

        /* ===== STRUCTURED SIGNAL PARSING ===== */
        let dominantLens = "";
        let pressureTrend = "";
        let ignoredArea = "";

        signalLines.forEach(line => {
          if (line.startsWith("dominant_lens")) {
            dominantLens = line.split(":")[1]?.trim();
          }
          if (line.startsWith("pressure_trend")) {
            pressureTrend = line.split(":")[1]?.trim();
          }
          if (line.startsWith("ignored")) {
            ignoredArea = line.split(":")[1]?.trim();
          }
        });

        /* ===== MULTI-MONTH PRESSURE MEMORY → STRIPE ===== */
        const subscriptionId =
          localStorage.getItem("subscriptionId");

        if (subscriptionId && dominantLens) {
          const now = new Date();
          const period =
            now.getFullYear() + "-" +
            String(now.getMonth() + 1).padStart(2, "0");

          fetch("/api/update-pressure-memory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscriptionId,
              period,
              dominantLens,
              pressureTrend,
              ignoredArea
            }),
          }).catch(() => {});
        }

        setAiText(visibleText);
      } else {
        setAiText(fullText);
      }

    } catch {
      setAiText("AI system temporarily unavailable.");
    }

    setLoading(false);
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
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          style={regionSelect}
        >
          {REGIONS.map(r => (
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

          <button onClick={runAI} style={aiButton}>
            {loading ? "Generating briefing…" : "Generate Monthly Briefing"}
          </button>
        </div>

        {/* ===== AI OUTPUT (DUAL MODE) ===== */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>AI Strategic Briefing</h3>

            {aiOpen && (
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => {
                    const nextMode =
                      analysisMode === "executive" ? "directive" : "executive";
                    setAnalysisMode(nextMode);
                    setTimeout(() => {
                      runAI();
                    }, 0);
                  }}
                  style={{
                    background: "transparent",
                    border: "1px solid #1e293b",
                    color: "#7dd3fc",
                    borderRadius: 8,
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  {analysisMode === "executive"
                    ? "Switch to Directive Analysis"
                    : "Back to Executive View"}
                </button>

                <button
                  onClick={() => setAiCollapsed(!aiCollapsed)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#7dd3fc",
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  {aiCollapsed ? "▾" : "▴"}
                </button>

                <button
                  onClick={() => setAiOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#7dd3fc",
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {!aiOpen && (
            <p style={{ opacity: 0.7 }}>
              Generate a briefing to receive a strategic interpretation
              of your next 90 days.
            </p>
          )}

          {aiOpen && !aiCollapsed && (
            <pre style={aiTextStyle}>{aiText}</pre>
          )}
        </div>
      </div>

      <div style={footer}>
        © 2026 WealthyAI · Monthly Intelligence
      </div>
    </div>
  );
}

/* ===== UI HELPERS ===== */

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

/* ===== STYLES ===== */

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

const footer = {
  marginTop: 60,
  textAlign: "center",
  fontSize: 13,
  color: "#64748b",
};
