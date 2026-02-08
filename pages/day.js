import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function DayPremium() {

  /* ===== MOBILE DETECTION ===== */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ===== MOUSE TRACKING ===== */
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (isMobile) return;
    const handleMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40,
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [isMobile]);

  /* ===== SUBSCRIPTION CHECK ===== */
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
      .then(res => res.json())
      .then(d => {
        if (!d.valid) window.location.href = "/start";
      })
      .catch(() => {
        window.location.href = "/start";
      });
  }, []);

  const [data, setData] = useState({
    income: 5000,
    fixed: 2000,
    variable: 1500,
  });

  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("userFinancials");
    if (saved) setData(JSON.parse(saved));
  }, []);

  const surplus = data.income - (data.fixed + data.variable);
  const savingsRate =
    data.income > 0 ? (surplus / data.income) * 100 : 0;
  const fiveYearProjection = surplus * 60 * 1.45;

  const chartData = [
    { name: "Now", value: surplus },
    { name: "Y1", value: surplus * 12 * 1.08 },
    { name: "Y3", value: surplus * 36 * 1.25 },
    { name: "Y5", value: surplus * 60 * 1.45 },
  ];

  const askAI = async () => {
    setLoading(true);
    setAiOpen(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "day",
          income: data.income,
          fixed: data.fixed,
          variable: data.variable,
        }),
      });
      const d = await res.json();
      setAiText(d.insight);
    } catch {
      setAiText("AI system temporarily unavailable.");
    }
    setLoading(false);
  };

  return (
    <div style={page}>
      <style>{`
        @keyframes morph {
          0% { border-radius: 40% 60% 60% 40% / 40% 40% 60% 60%; }
          34% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
          67% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 40%; }
          100% { border-radius: 40% 60% 60% 40% / 40% 40% 60% 60%; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <a href="/day/help" style={{
        ...helpButton,
        top: isMobile ? 12 : 24,
        right: isMobile ? 12 : 24
      }}>Help</a>

      <div style={{
        ...contentWrap,
        padding: isMobile ? "60px 15px 120px 15px" : "40px"
      }}>
        <div style={header}>
          <h1 style={{
            ...title,
            fontSize: isMobile ? "1.6rem" : "2.6rem"
          }}>WEALTHYAI · PRO INTELLIGENCE</h1>
          <p style={subtitle}>
            Thank you for choosing the <strong>1-Day Professional Access</strong>.
          </p>
        </div>

        <div style={{
          ...layout,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1.3fr",
          gap: isMobile ? "20px" : "40px",
          position: "relative"
        }}>
          <div>
            <Metric label="MONTHLY SURPLUS" value={`$${surplus.toLocaleString()}`} isMobile={isMobile} />
            <Metric label="SAVINGS RATE" value={`${savingsRate.toFixed(1)}%`} isMobile={isMobile} />
            <Metric
              label="5Y PROJECTION"
              value={`$${Math.round(fiveYearProjection).toLocaleString()}`}
              isMobile={isMobile}
            />

            <button onClick={askAI} style={aiButton}>
              {loading ? "ANALYZING…" : "GENERATE AI STRATEGY"}
            </button>

            {aiOpen && (
              <div style={aiBox}>
                <div style={aiHeader}>
                  <strong>AI Insight</strong>
                  <button onClick={() => setAiOpen(false)} style={closeBtn}>✕</button>
                </div>
                <pre style={aiTextStyle}>{aiText}</pre>
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            {aiOpen && (
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                zIndex: 1,
                pointerEvents: "none",
                transform: isMobile 
                  ? "translate(-50%, -50%)" 
                  : `translate(calc(-50% + ${mousePos.x}px), calc(-50% + ${mousePos.y}px))`
              }}>
                <div style={{
                  width: "300px",
                  height: "300px",
                  background: "radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)",
                  animation: "morph 12s ease-in-out infinite, spin 20s linear infinite",
                  filter: "blur(40px)",
                  position: "absolute",
                  top: "-150px",
                  left: "-150px",
                }}></div>
              </div>
            )}

            <div style={{...inputPanel, position: "relative", zIndex: 5}}>
              {["income", "fixed", "variable"].map((k) => (
                <div key={k} style={inputRow}>
                  <span>{k.toUpperCase()}</span>
                  <input
                    type="number"
                    value={data[k]}
                    onChange={(e) =>
                      setData({ ...data, [k]: Number(e.target.value) })
                    }
                    style={input}
                  />
                </div>
              ))}
            </div>

            <div style={{
              ...chartGrid,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              position: "relative",
              zIndex: 5
            }}>
              <MiniChart title="Cash Flow Projection" data={chartData} />
              <MiniBar title="Expense Distribution" value={data.fixed + data.variable} />
            </div>
          </div>
        </div>
      </div>

      {!isMobile && (
        <div style={footerLeft}>
          © 2026 WealthyAI — All rights reserved.
        </div>
      )}

      <div style={{
        ...upsellFixed,
        position: isMobile ? "relative" : "fixed",
        padding: isMobile ? "20px" : "20px 0",
        background: isMobile ? "rgba(2,6,23,0.8)" : "transparent",
        backdropFilter: isMobile ? "blur(8px)" : "none",
        fontSize: isMobile ? "12px" : "14px",
        borderTop: isMobile ? "1px solid rgba(255,255,255,0.05)" : "none", 
      }}>
        Weekly and Monthly plans unlock country-specific tax optimization,
        stress testing and advanced projections.
        {isMobile && <div style={{marginTop: 10, fontSize: 10, opacity: 0.6}}>© 2026 WealthyAI</div>}
      </div>
    </div>
  );
}

/* ===== COMPONENTS ===== */

function Metric({ label, value, isMobile }) {
  return (
    <div style={{
      ...metric,
      marginBottom: isMobile ? "15px" : "25px"
    }}>
      <div style={metricLabel}>{label}</div>
      <div style={{
        ...metricValue,
        fontSize: isMobile ? "1.6rem" : "2.2rem"
      }}>{value}</div>
    </div>
  );
}

function MiniChart({ title, data }) {
  return (
    <div style={chartBox}>
      <div style={chartTitle}>{title}</div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <CartesianGrid stroke="#0f172a" strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
          <YAxis stroke="#64748b" fontSize={10} />
          <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
          <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniBar({ title, value }) {
  const data = [{ name: "Total", v: value }];
  return (
    <div style={chartBox}>
      <div style={chartTitle}>{title}</div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
          <YAxis stroke="#64748b" fontSize={10} />
          <Bar dataKey="v" fill="#22d3ee" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ===== STYLES ===== */

const page = {
  minHeight: "100vh",
  position: "relative",
  color: "#e5e7eb",
  fontFamily: "Inter, system-ui, sans-serif",
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
  backgroundSize: "auto, auto, 100% 100%, 100% 100%, 100% 100%, 280px auto",
  backgroundPosition: "center",
  overflowX: "hidden"
};

const contentWrap = { width: "100%", boxSizing: "border-box" };
const header = { marginBottom: "30px", textAlign: "center" };
const title = { margin: 0, fontWeight: "bold" };
const subtitle = { color: "#f8fafc", marginTop: "10px" };

const helpButton = {
  position: "absolute",
  padding: "8px 14px",
  borderRadius: 10,
  fontSize: 13,
  textDecoration: "none",
  color: "#7dd3fc",
  border: "1px solid #1e293b",
  background: "rgba(2,6,23,0.6)",
  backdropFilter: "blur(6px)",
  zIndex: 100,
};

const layout = { display: "grid", maxWidth: "1200px", margin: "0 auto" };
const metric = { width: "100%" };
const metricLabel = { color: "#7dd3fc", fontSize: "0.8rem", letterSpacing: "1px" };
const metricValue = { fontWeight: "bold" };

const aiBox = {
  marginTop: "20px",
  background: "rgba(2,6,23,0.8)",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "16px",
  backdropFilter: "blur(10px)"
};

const aiHeader = { display: "flex", justifyContent: "space-between", marginBottom: 10 };
const closeBtn = { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "18px" };

const aiButton = {
  width: "100%",
  padding: "14px",
  background: "#38bdf8",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  color: "#020617",
  cursor: "pointer",
};

const aiTextStyle = {
  marginTop: "10px",
  whiteSpace: "pre-wrap",
  color: "#cbd5f5",
  fontSize: "14px",
  lineHeight: "1.5",
  fontFamily: "inherit"
};

const inputPanel = {
  marginBottom: "20px",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "15px",
  background: "rgba(30, 41, 59, 0.2)"
};

const inputRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" };

const input = {
  background: "rgba(56, 189, 248, 0.05)",
  border: "1px solid rgba(56, 189, 248, 0.2)",
  borderRadius: "4px",
  padding: "5px 10px",
  color: "#38bdf8",
  textAlign: "right",
  width: "100px",
  fontSize: "16px"
};

const chartGrid = { display: "grid", gap: "16px" };
const chartBox = { background: "rgba(2, 6, 23, 0.7)", border: "1px solid #1e293b", borderRadius: "12px", padding: "12px" };
const chartTitle = { fontSize: "0.75rem", color: "#7dd3fc", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" };

const upsellFixed = {
  bottom: 0,
  left: 0,
  width: "100%",
  textAlign: "center",
  color: "#f8fafc",
  boxSizing: "border-box",
  zIndex: 5,
};

const footerLeft = { position: "fixed", bottom: 20, left: 20, fontSize: "12px", opacity: 0.5 };
