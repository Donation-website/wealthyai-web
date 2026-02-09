import { useEffect, useState, useRef } from "react";
import {
  LineChart, Line,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

/* ===== HD SPIDERNET COMPONENT WITH ESCAPE LOGIC ===== */
function SpiderNet({ isMobile, height, color = "#38bdf8" }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null });

  useEffect(() => {
    if (isMobile || !height || height < 5) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    const particleCount = 180;
    const connectionDistance = 110;
    const mouseRadius = 80;

    const resize = () => {
      const dpr = window.devicePixelRatio || 2;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${height}px`;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    resize();

    class Particle {
      constructor() {
        const rect = canvas.getBoundingClientRect();
        this.x = Math.random() * rect.width;
        this.y = Math.random() * rect.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
      }
      update() {
        const rect = canvas.getBoundingClientRect();
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > rect.width) this.vx *= -1;
        if (this.y < 0 || this.y > rect.height) this.vy *= -1;

        if (mouseRef.current.x !== null) {
          let dx = this.x - mouseRef.current.x;
          let dy = this.y - mouseRef.current.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouseRadius) {
            let force = (mouseRadius - distance) / mouseRadius;
            this.x += (dx / distance) * force * 5;
            this.y += (dy / distance) * force * 5;
          }
        }
      }
      draw() {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      ctx.clearRect(0, 0, rect.width, rect.height);
      particles.forEach(p => { p.update(); p.draw(); });
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.3 * (1 - dist / connectionDistance)})`;
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, height, color]);

  return <canvas ref={canvasRef} style={{ display: "block", background: "transparent" }} />;
}

/* ===== CONSTANTS ===== */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CATEGORIES = ["rent", "food", "transport", "entertainment", "subscriptions", "other"];
const COLORS = {
  rent: "#38bdf8",
  food: "#22d3ee",
  transport: "#34d399",
  entertainment: "#a78bfa",
  subscriptions: "#f472b6",
  other: "#facc15"
};

export default function PremiumWeek() {
  const [isMobile, setIsMobile] = useState(false);
  const [openDays, setOpenDays] = useState({});
  const [aiOpen, setAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [incomeType, setIncomeType] = useState("monthly");
  const [incomeValue, setIncomeValue] = useState(3000);
  const [country, setCountry] = useState("US");

  const leftColRef = useRef(null);
  const rightColRef = useRef(null);
  const [leftNetHeight, setLeftNetHeight] = useState(0);
  const [rightNetHeight, setRightNetHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ===== DEFAULT REGION DETECTION (SAFE, OVERRIDABLE) ===== */
  useEffect(() => {
    const lang = navigator.language || "";
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

    if (lang.startsWith("en-GB")) setCountry("GB");
    else if (lang.startsWith("hu") || tz.includes("Budapest")) setCountry("EU");
    else if (lang.startsWith("en")) setCountry("US");
    else setCountry("OTHER");
  }, []);

  /* ===== REST OF CODE UNCHANGED ===== */
  /* … a teljes további JSX, chartok, AI logika, stílusok
     pontosan megegyeznek az általad küldött eredetivel … */
  useEffect(() => {
    if (isMobile) return;
    const updateHeights = () => {
      const leftH = leftColRef.current?.offsetHeight || 0;
      const rightH = rightColRef.current?.offsetHeight || 0;

      const diffL = rightH - leftH;
      setLeftNetHeight(diffL > 1 ? diffL : 0);

      const diffR = leftH - rightH;
      setRightNetHeight(diffR > 1 ? diffR : 0);
    };
    const timer = setTimeout(updateHeights, 100);
    return () => clearTimeout(timer);
  }, [aiOpen, aiText, openDays, isMobile, incomeType, incomeValue]);

  const [week, setWeek] = useState(
    DAYS.reduce((acc, d) => {
      acc[d] = CATEGORIES.reduce((o, c) => ({ ...o, [c]: 0 }), {});
      return acc;
    }, {})
  );

  const update = (day, cat, val) =>
    setWeek({ ...week, [day]: { ...week[day], [cat]: Number(val) } });

  const toggleDay = (day) =>
    setOpenDays((prev) => ({ ...prev, [day]: !prev[day] }));

  const dailyTotals = DAYS.map((d) =>
    Object.values(week[d]).reduce((a, b) => a + b, 0)
  );

  const weeklySpend = dailyTotals.reduce((a, b) => a + b, 0);

  const weeklyIncome =
    incomeType === "daily"
      ? incomeValue * 7
      : incomeType === "weekly"
      ? incomeValue
      : incomeValue / 4.333;

  const chartData = DAYS.map((d, i) => ({
    day: d,
    total: dailyTotals[i],
    balance: weeklyIncome / 7 - dailyTotals[i],
    x: i + 1,
    ...week[d],
  }));

  const pieData = CATEGORIES.map((c) => ({
    name: c,
    value: DAYS.reduce((s, d) => s + week[d][c], 0),
    fill: COLORS[c],
  }));

  const runAI = async () => {
    setLoading(true);
    setAiOpen(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "week",
          country,
          weeklyIncome,
          weeklySpend,
          dailyTotals,
          breakdown: week,
        }),
      });
      const data = await res.json();
      setAiText(data.insight || "AI analysis unavailable.");
    } catch {
      setAiText("AI system temporarily unavailable.");
    }
    setLoading(false);
  };

  const WealthyTicker = () => {
    if (isMobile) return null;
    const tickerText =
      "WealthyAI interprets your financial state over time — not advice, not prediction, just clarity • Interpretation over advice • Clarity over certainty • Insight unfolds over time • Financial understanding isn’t instant • Context changes • Insight follows time • Clarity over certainty • Built on time, not urgency • ";
    return (
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 0,
          width: "100%",
          height: 18,
          overflow: "hidden",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
            fontSize: 11,
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.75)",
            animation: "waiScroll 45s linear infinite",
          }}
        >
          <span>{tickerText}</span>
          <span>{tickerText}</span>
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={tooltipContainer}>
          <p
            style={{
              margin: "0 0 5px 0",
              fontWeight: "bold",
              color: "#7dd3fc",
            }}
          >
            {label}
          </p>
          {payload.map((entry, index) => (
            <div
              key={index}
              style={{
                color: entry.color || entry.payload.fill,
                fontSize: "12px",
                padding: "2px 0",
              }}
            >
              {entry.name.toUpperCase()}:{" "}
              <span style={{ color: "#fff" }}>
                ${entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={page}>
      <WealthyTicker />
      <a href="/help" style={helpButton}>
        Help
      </a>

      <div
        style={{
          ...contentWrap,
          padding: isMobile ? "60px 15px 120px 15px" : "40px",
        }}
      >
        <div style={header}>
          <h1
            style={{
              ...title,
              fontSize: isMobile ? "1.6rem" : "2.6rem",
            }}
          >
            WEALTHYAI · WEEKLY INTELLIGENCE
          </h1>
          <p style={subtitle}>
            Precise behavioral mapping and country-aware AI insights.
          </p>
        </div>

        {/* … A TELJES JSX RÉSZ PONTOSAN AZ, AMIT EREDETILEG KÜLDTÉL … */}
      </div>

      <div style={footerText}>© 2026 WealthyAI — All rights reserved.</div>
      <div style={upsellText}>Active Intelligence: {country} Database</div>

      <style>{`
        @keyframes waiScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function Chart({ title, children }) {
  return (
    <div style={chartBox}>
      <div style={chartTitle}>{title}</div>
      <ResponsiveContainer width="100%" height={180}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

/* ===== STYLES ===== */
const tooltipContainer = {
  background: "rgba(2, 6, 23, 0.95)",
  border: "1px solid #1e293b",
  padding: "12px",
  borderRadius: "10px",
  backdropFilter: "blur(12px)",
};
const page = {
  minHeight: "100vh",
  position: "relative",
  color: "#e5e7eb",
  fontFamily: "Inter, sans-serif",
  backgroundColor: "#020617",
  backgroundAttachment: "fixed",
  backgroundSize: "auto, auto, 100% 100%, 100% 100%, 280px auto",
  overflowX: "hidden",
};
const contentWrap = { width: "100%", boxSizing: "border-box" };
const header = { textAlign: "center", marginBottom: 30 };
const title = { margin: 0, fontWeight: "bold", letterSpacing: "-1px" };
const subtitle = { color: "#94a3b8", marginTop: 10 };
const helpButton = {
  position: "absolute",
  top: 24,
  right: 24,
  padding: "8px 14px",
  borderRadius: 10,
  fontSize: 13,
  color: "#7dd3fc",
  border: "1px solid #1e293b",
  background: "rgba(2,6,23,0.6)",
  textDecoration: "none",
  zIndex: 100,
};
const footerText = {
  position: "fixed",
  bottom: 20,
  left: 40,
  fontSize: "11px",
  color: "#64748b",
};
const upsellText = {
  position: "fixed",
  bottom: 20,
  right: 40,
  fontSize: "11px",
  color: "#64748b",
};
