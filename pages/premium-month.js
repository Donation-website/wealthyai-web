import { useState, useEffect } from "react";

/* ===== REGIONS ===== */
const REGIONS = [
  { code: "US", label: "United States" },
  { code: "EU", label: "European Union" },
  { code: "UK", label: "United Kingdom" },
  { code: "HU", label: "Hungary" },
];

/* ===== MAIN COMPONENT ===== */

export default function PremiumMonth() {
  const [region, setRegion] = useState("EU");

  const [inputs, setInputs] = useState({
    income: 4000,
    fixedRatio: 50,
    variableRatio: 30,
    optionalRatio: 20,
  });

  const update = (k, v) =>
    setInputs({ ...inputs, [k]: Number(v) });

  /* ===== MOCK SIGNALS (AI LATER) ===== */

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

      {/* LAYOUT */}
      <div style={layout}>
        {/* INPUT PANEL */}
        <div style={card}>
          <h3>Financial Structure</h3>

          <label>Monthly Income</label>
          <input
            type="number"
            value={inputs.income}
            onChange={(e) => update("income", e.target.value)}
            style={input}
          />

          <Divider />

          <label>Fixed Commitments (%)</label>
          <input
            type="range"
            min={0}
            max={100}
            value={inputs.fixedRatio}
            onChange={(e) => update("fixedRatio", e.target.value)}
          />
          <Value>{inputs.fixedRatio}%</Value>

          <label>Variable Living Costs (%)</label>
          <input
            type="range"
            min={0}
            max={100}
            value={inputs.variableRatio}
            onChange={(e) => update("variableRatio", e.target.value)}
          />
          <Value>{inputs.variableRatio}%</Value>

          <label>Optional / Discretionary (%)</label>
          <input
            type="range"
            min={0}
            max={100}
            value={inputs.optionalRatio}
            onChange={(e) => update("optionalRatio", e.target.value)}
          />
          <Value>{inputs.optionalRatio}%</Value>

          <p style={note}>
            Percentages don’t need to be exact.  
            This briefing focuses on structure, not precision.
          </p>
        </div>

        {/* BRIEFING */}
        <div style={card}>
          <h3>90-Day Financial Briefing</h3>

          <p>
            Based on your current income level and expense structure,
            your financial position appears stable but moderately constrained.
          </p>

          <p>
            The dominant factor over the next 90 days is not income volatility,
            but the proportion of pre-committed expenses limiting flexibility.
          </p>

          <p>
            In the selected region, structural decisions tend to outweigh
            short-term optimizations, especially when fixed ratios exceed
            discretionary capacity.
          </p>

          <Divider />

          <strong>What You Can Ignore</strong>
          <p>
            Small day-to-day fluctuations are unlikely to materially change
            your medium-term outcome.
          </p>

          <Divider />

          <strong>Direction</strong>
          <p>
            If no changes are made, the next three months are expected
            to remain stable, with gradually decreasing optionality.
          </p>
        </div>
      </div>

      {/* SCENARIO MODE */}
      <div style={scenarioBox}>
        <h3>Scenario Mode (Sandbox)</h3>
        <p>
          Test “what if” changes without affecting your baseline outlook.
        </p>
        <button style={scenarioBtn}>Enable Scenario Mode</button>
      </div>

      {/* FOOTER */}
      <div style={footer}>
        © 2026 WealthyAI · Monthly Intelligence
      </div>
    </div>
  );
}

/* ===== UI HELPERS ===== */

const Divider = () => (
  <div style={{ height: 1, background: "#1e293b", margin: "18px 0" }} />
);

const Value = ({ children }) => (
  <div style={{ color: "#7dd3fc", marginBottom: 12 }}>{children}</div>
);

/* ===== STYLES ===== */

const page = {
  minHeight: "100vh",
  padding: 40,
  backgroundColor: "#020617",
  color: "#e5e7eb",
  fontFamily: "Inter, system-ui",
};

const header = { textAlign: "center", marginBottom: 20 };
const title = { fontSize: "2.4rem", margin: 0 };
const subtitle = { marginTop: 8, color: "#cbd5f5" };

const regionRow = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
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
  marginBottom: 14,
  background: "rgba(255,255,255,0.08)",
  border: "none",
  borderRadius: 8,
  color: "white",
};

const note = {
  marginTop: 16,
  fontSize: 13,
  color: "#94a3b8",
};

const scenarioBox = {
  maxWidth: 800,
  margin: "50px auto 0",
  padding: 24,
  textAlign: "center",
  borderRadius: 18,
  border: "1px dashed #334155",
};

const scenarioBtn = {
  marginTop: 16,
  padding: "10px 18px",
  borderRadius: 10,
  border: "none",
  background: "#38bdf8",
  fontWeight: "bold",
  cursor: "pointer",
};

const footer = {
  marginTop: 60,
  textAlign: "center",
  fontSize: 13,
  color: "#64748b",
};
