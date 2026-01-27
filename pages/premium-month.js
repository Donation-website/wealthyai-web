import { useState } from "react";

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

  const update = (k, v) =>
    setInputs({ ...inputs, [k]: Number(v) });

  /* ===== PLACEHOLDER DAILY SIGNAL ===== */
  const dailySignal = "No structural change detected today.";

  return (
    <div style={page}>
      {/* HEADER */}
      <div style={header}>
        <h1 style={title}>WEALTHYAI · MONTHLY BRIEFING</h1>
        <p style={subtitle}>
          Strategic financial outlook · Next 90 days
        </p>
      </div>

      {/* REGION SELECT */}
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

      {/* DAILY SIGNAL */}
      <div style={signalBox}>
        <strong>Daily Signal</strong>
        <p>{dailySignal}</p>
      </div>

      {/* MAIN LAYOUT */}
      <div style={layout}>
        {/* INPUT PANEL */}
        <div style={card}>
          <h3>Monthly Financial Structure</h3>

          <Label>Income</Label>
          <Input
            value={inputs.income}
            onChange={e => update("income", e.target.value)}
          />

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

          <p style={note}>
            Values can be estimates.  
            This briefing focuses on structure, not precision.
          </p>
        </div>

        {/* BRIEFING PANEL */}
        <div style={card}>
          <h3>90-Day Financial Briefing</h3>

          <p>
            Your financial structure shows a high concentration of fixed and
            recurring costs relative to discretionary flexibility.
          </p>

          <p>
            In the selected region, electricity and gas services are often
            structurally adjustable, while water costs are typically regulated
            and less flexible.
          </p>

          <p>
            Recurring services such as internet, mobile, and banking fees
            represent potential leverage points that do not require lifestyle
            changes.
          </p>

          <Divider />

          <strong>What You Can Ignore</strong>
          <p>
            Short-term daily fluctuations and small discretionary optimizations
            are unlikely to materially alter your 90-day outlook.
          </p>

          <Divider />

          <strong>Direction</strong>
          <p>
            If no structural changes are made, the next three months are expected
            to remain stable, with gradually decreasing optionality rather than
            acute risk.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div style={footer}>
        © 2026 WealthyAI · Monthly Intelligence
      </div>
    </div>
  );
}

/* ===== SMALL COMPONENTS ===== */

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
  padding: 40,
  color: "#e5e7eb",
  fontFamily: "Inter, system-ui",
  backgroundColor: "#020617",
  backgroundImage: `
    repeating-linear-gradient(-25deg, rgba(56,189,248,0.06) 0px, rgba(56,189,248,0.06) 1px, transparent 1px, transparent 180px),
    repeating-linear-gradient(35deg, rgba(167,139,250,0.05) 0px, rgba(167,139,250,0.05) 1px, transparent 1px, transparent 260px),
    radial-gradient(circle at 20% 30%, rgba(56,189,248,0.18), transparent 45%),
    radial-gradient(circle at 80% 60%, rgba(167,139,250,0.18), transparent 50%),
    radial-gradient(circle at 45% 85%, rgba(34,211,238,0.14), transparent 45%),
    url("/wealthyai/icons/generated.png")
  `,
  backgroundRepeat: "repeat, repeat, no-repeat, no-repeat, no-repeat, repeat",
  backgroundSize: "auto, auto, 100% 100%, 100% 100%, 100% 100%, 420px auto",
};

const header = { textAlign: "center", marginBottom: 20 };
const title = { fontSize: "2.4rem", margin: 0 };
const subtitle = { marginTop: 8, color: "#cbd5f5" };

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
  background: "rgba(255,255,255,0.04)",
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
  background: "rgba(255,255,255,0.05)",
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

const note = {
  marginTop: 16,
  fontSize: 13,
  color: "#94a3b8",
};

const footer = {
  marginTop: 60,
  textAlign: "center",
  fontSize: 13,
  color: "#64748b",
};
