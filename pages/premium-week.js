import { useEffect, useState } from "react";  
import {
  LineChart, Line,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

/* ===== CONSTANTS ===== */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CATEGORIES = ["rent", "food", "transport", "entertainment", "subscriptions", "other"];
const COLORS = {
  rent: "#38bdf8",
  food: "#22d3ee",
  transport: "#34d399",
  entertainment: "#a78bfa",
  subscriptions: "#f472b6",
  other: "#facc15",
};

export default function PremiumWeek() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) { window.location.href = "/start"; return; }

    fetch("/api/verify-active-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(res => res.json())
      .then(d => { if (!d.valid) window.location.href = "/start"; })
      .catch(() => { window.location.href = "/start"; });
  }, []);

  const [incomeType, setIncomeType] = useState("monthly");
  const [incomeValue, setIncomeValue] = useState(3000);
  const [country, setCountry] = useState("US");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lang = navigator.language || "";
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (lang.startsWith("hu") || tz.includes("Budapest")) setCountry("HU");
    else if (lang.startsWith("en-GB")) setCountry("UK");
    else if (lang.startsWith("en")) setCountry("US");
    else setCountry("EU");
  }, []);

  const [week, setWeek] = useState(
    DAYS.reduce((acc, d) => {
      acc[d] = CATEGORIES.reduce((o, c) => ({ ...o, [c]: 0 }), {});
      return acc;
    }, {})
  );

  const weeklyIncome =
    incomeType === "daily" ? incomeValue * 7 :
    incomeType === "weekly" ? incomeValue :
    incomeValue / 4.333;

  const update = (day, cat, val) => {
    setWeek({ ...week, [day]: { ...week[day], [cat]: Number(val) } });
  };

  const dailyTotals = DAYS.map(d => Object.values(week[d]).reduce((a, b) => a + b, 0));
  const weeklySpend = dailyTotals.reduce((a, b) => a + b, 0);

  const chartData = DAYS.map((d, i) => ({
    day: d,
    total: dailyTotals[i],
    balance: (weeklyIncome / 7) - dailyTotals[i],
    ...week[d],
  }));

  const pieData = CATEGORIES.map(c => ({
    name: c,
    value: DAYS.reduce((s, d) => s + week[d][c], 0),
  }));

  const scatterData = DAYS.map((d, i) => ({
    x: i + 1,
    y: dailyTotals[i],
    day: d,
  }));

  const runAI = async () => {
    setLoading(true);
    setAiOpen(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "week", country, weeklyIncome, weeklySpend, dailyTotals, breakdown: week }),
      });
      const data = await res.json();
      setAiText(data.insight || "AI analysis unavailable.");
    } catch {
      setAiText("AI system temporarily unavailable.");
    }
    setLoading(false);
  };

  return (
    <div style={{...page, padding: isMobile ? "20px 15px 120px 15px" : "40px"}}>
      <a href="/help" style={{...helpButton, top: isMobile ? 15 : 24, right: isMobile ? 15 : 24}}>Help</a>

      <div style={header}>
        <h1 style={{...title, fontSize: isMobile ? "1.6rem" : "2.6rem"}}>WEALTHYAI · WEEKLY INTELLIGENCE</h1>
        <p style={subtitle}>Weekly behavioral analysis with country-aware intelligence.</p>
      </div>

      <div style={{...layout, gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1.3fr", gap: isMobile ? 20 : 30}}>
        <div style={left}>
          <div style={incomeBox}>
            <div style={{color: "#7dd3fc", fontSize: "0.8rem", marginBottom: 10, fontWeight: "bold"}}>WEEKLY INCOME SETUP</div>
            <div style={row}>
              <select value={incomeType} onChange={(e) => setIncomeType(e.target.value)} style={regionSelect}>
                <option value="daily">Daily Income</option>
                <option value="weekly">Weekly Income</option>
                <option value="monthly">Monthly Income</option>
              </select>
              <input type="number" value={incomeValue} onChange={(e) => setIncomeValue(Number(e.target.value))} style={input} />
            </div>
          </div>

          <div style={regionRow}>
            <span style={regionLabel}>Region</span>
            <select value={country} onChange={(e) => setCountry(e.target.value)} style={regionSelect}>
              <option value="US">United States</option>
              <option value="EU">European Union</option>
              <option value="UK">United Kingdom</option>
              <option value="HU">Hungary</option>
            </select>
          </div>

          {DAYS.map((d, i) => (
            <details key={d} open={i === 0} style={dayBox}>
              <summary style={dayTitle}>{d}</summary>
              <div style={{marginTop: 10}}>
                {CATEGORIES.map(c => (
                  <div key={c} style={row}>
                    <span style={{fontSize: "0.8rem"}}>{c.toUpperCase()}</span>
                    <input type="number" value={week[d][c]} onChange={e => update(d, c, e.target.value)} style={input} />
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>

        <div style={{...right, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr"}}>
          <Chart title="Daily spending vs Income">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
              <XAxis dataKey="day" fontSize={10} stroke="#cbd5ee" />
              <YAxis fontSize={10} stroke="#cbd5ee" />
              <Tooltip contentStyle={{background: "#020617", color: "#ffffff", border: "1px solid #38bdf8"}} />
              <Line dataKey="total" name="Spending" stroke="#38bdf8" strokeWidth={3} dot={{r: 4}} />
              <Line dataKey="balance" name="Net Balance" stroke="#facc15" strokeDasharray="5 5" />
            </LineChart>
          </Chart>

          <Chart title="Category trends">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
              <XAxis dataKey="day" fontSize={10} stroke="#cbd5ee" />
              <YAxis fontSize={10} stroke="#cbd5ee" />
              <Tooltip contentStyle={{background: "#020617", color: "#ffffff", border: "1px solid #38bdf8"}} />
              <Legend wrapperStyle={{fontSize: 10, color: "#cbd5ee"}} />
              {CATEGORIES.map(c => (
                <Line key={c} dataKey={c} stroke={COLORS[c]} dot={false} strokeWidth={2} />
              ))}
            </LineChart>
          </Chart>
          
          <Chart title="Weekly distribution">
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={isMobile ? 60 : 80} stroke="none">
                {pieData.map((p, i) => (
                  <Cell key={i} fill={COLORS[p.name]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{background: "#020617", color: "#ffffff", border: "1px solid #38bdf8"}} />
            </PieChart>
          </Chart>

          <Chart title="Daily dispersion">
            <ScatterChart>
              <CartesianGrid stroke="#0f172a" />
              <XAxis dataKey="x" name="Day index" fontSize={10} stroke="#cbd5ee" />
              <YAxis dataKey="y" name="Spending" fontSize={10} stroke="#cbd5ee" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div style={{background: "#020617", padding: 10, border: "1px solid #a78bfa", color: "#ffffff"}}>
                        <div><strong>Day:</strong> {d.day}</div>
                        <div><strong>Spending:</strong> ${d.y}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={scatterData} fill="#a78bfa" />
            </ScatterChart>
          </Chart>

          <div style={{...summary, gridColumn: "1 / -1"}}>
            Weekly spend: <strong style={{color: "#fb7185"}}>${Math.round(weeklySpend).toLocaleString()}</strong> ·
            Net Surplus: <strong style={{color: "#34d399"}}>${Math.round(weeklyIncome - weeklySpend).toLocaleString()}</strong>
          </div>

          <button onClick={runAI} style={{...aiButton, gridColumn: "1 / -1", marginTop: 10}}>
            {loading ? "Analyzing…" : "Run Weekly AI Analysis"}
          </button>

          {aiOpen && (
            <div style={{...aiBox, gridColumn: "1 / -1"}}>
              <div style={aiHeader}>
                <strong>Weekly AI Insight</strong>
                <button onClick={() => setAiOpen(false)} style={closeBtn}>✕</button>
              </div>
              <pre style={{...aiTextStyle, fontSize: isMobile ? "0.85rem" : "1rem"}}>{aiText}</pre>
            </div>
          )}
        </div>
      </div>

      <div style={{...upsellRow, width: isMobile ? "90%" : "auto", bottom: isMobile ? 60 : 20}}>
        Monthly plans unlock country-specific tax optimization, stress testing and advanced projections.
      </div>
      <div style={{...copyright, left: isMobile ? 0 : 40, width: isMobile ? "100%" : "auto", textAlign: isMobile ? "center" : "left"}}>
        © 2026 WealthyAI — All rights reserved.
      </div>
    </div>
  );
}

function Chart({ title, children }) {
  return (
    <div style={chartBox}>
      <div style={chartTitle}>{title}</div>
      <ResponsiveContainer width="100%" height={220}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

/* ===== STYLES ===== */
const page = {
  minHeight: "100vh",
  position: "relative",
  fontFamily: "Inter, system-ui",
  backgroundColor: "#020617",
  color: "#e5e7eb",
  backgroundImage: `
    repeating-linear-gradient(-25deg, rgba(56,189,248,0.07) 0px, rgba(56,189,248,0.07) 1px, transparent 1px, transparent 160px),
    repeating-linear-gradient(35deg, rgba(167,139,250,0.06) 0px, rgba(167,139,250,0.06) 1px, transparent 1px, transparent 220px),
    radial-gradient(circle at 20% 30%, rgba(56,189,248,0.22), transparent 40%),
    radial-gradient(circle at 80% 60%, rgba(167,139,250,0.22), transparent 45%),
    radial-gradient(circle at 45% 85%, rgba(34,211,238,0.18), transparent 40%),
    url("/wealthyai/icons/generated.png")
  `,
  backgroundRepeat: "repeat, repeat, no-repeat, no-repeat, no-repeat, repeat",
  backgroundSize: "auto, auto, 100% 100%, 100% 100%, 100% 100%, 420px auto",
  backgroundAttachment: "fixed",
  overflowX: "hidden"
};

const header = { textAlign: "center", marginBottom: 20 };
const title = { margin: 0, fontWeight: "bold" };
const subtitle = { color: "#f8fafc", marginTop: 10, opacity: 0.8 };
const upsellRow = { position: "absolute", left: "50%", transform: "translateX(-50%)", color: "#f8fafc", fontWeight: 500, fontSize: 12, zIndex: 10, opacity: 0.7 };
const copyright = { position: "absolute", bottom: 20, zIndex: 10, fontSize: 12, color: "#94a3b8" };
const helpButton = { position: "absolute", padding: "8px 14px", borderRadius: 10, fontSize: 13, textDecoration: "none", color: "#7dd3fc", border: "1px solid #1e293b", background: "rgba(2,6,23,0.6)", zIndex: 15 };
const regionRow = { marginBottom: 20, textAlign: "left" };
const regionLabel = { marginRight: 8, color: "#7dd3fc", fontSize: "0.85rem" };
const regionSelect = { background: "#0f172a", color: "#e5e7eb", border: "1px solid #1e293b", padding: "6px 10px", borderRadius: 6, fontSize: "14px" };
const layout = { display: "grid", maxWidth: "1300px", margin: "0 auto" };
const left = { overflowY: "visible" };
const right = { display: "grid", gap: 16 };
const dayTitle = { cursor: "pointer", color: "#38bdf8", fontWeight: "bold", fontSize: "1.1rem" };
const row = { display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" };
const input = { background: "rgba(56,189,248,0.05)", border: "none", borderBottom: "1px solid #38bdf8", color: "#38bdf8", width: 90, textAlign: "right", padding: "4px 8px", fontSize: "16px" };
const chartTitle = { fontSize: 11, color: "#7dd3fc", marginBottom: 10, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.8 };
const aiHeader = { display: "flex", justifyContent: "space-between", marginBottom: 10 };
const closeBtn = { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18 };
const aiButton = { width: "100%", padding: 16, background: "#38bdf8", border: "none", borderRadius: 12, fontWeight: "bold", color: "#020617", cursor: "pointer", fontSize: "1rem" };
const aiTextStyle = { marginTop: 10, whiteSpace: "pre-wrap", lineHeight: 1.5 };

/* ===== "JÓ" BOX SZÍNEK ===== */
const incomeBox = { background: "rgba(15,23,42,0.6)", backdropFilter: "blur(14px)", border: "1px solid rgba(56,189,248,0.4)", borderRadius: 14, padding: 15, marginBottom: 20 };
const dayBox = { background: "rgba(15,23,42,0.6)", backdropFilter: "blur(14px)", border: "1px solid rgba(167,139,250,0.35)", borderRadius: 14, padding: 16, marginBottom: 12 };
const chartBox = { background: "rgba(15,23,42,0.55)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 14, padding: 12 };
const summary = { marginTop: 10, padding: 20, color: "#f8fafc", background: "rgba(15,23,42,0.6)", borderRadius: 14, textAlign: "center", border: "1px solid rgba(255,255,255,0.18)" };
const aiBox = { background: "rgba(15,23,42,0.7)", backdropFilter: "blur(14px)", border: "1px solid #a78bfa", borderRadius: 14, padding: 20, marginTop: 15 };
