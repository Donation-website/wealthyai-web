import { useState, useEffect, useRef } from "react";
import {
  saveMonthlySnapshot,
  getMonthlySnapshots,
  getSnapshotByDay,
} from "../lib/monthlyArchive";

/* ================= AUTOMATIC REGION DETECTION ================= */
const detectRegion = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes("Budapest") || tz.includes("Hungary")) return "HU";
    // Itt további országokat is hozzáadhatsz, ha szükséges
    return "EU";
  } catch (e) {
    return "EU";
  }
};

/* ================= SPIDERNET COMPONENT (FINAL FIXED VERSION) ================= */
function SpiderNet({ isMobile, height, isVisible }) {
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Csak akkor fusson, ha látható és nem mobil
    if (isMobile || !isVisible || !height || height < 10) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];

    const particleCount = 180; // Kicsit kevesebb, de dinamikusabb pont
    const connectionDistance = 140;
    const mouse = { x: null, y: null, radius: 170 };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const clearMouse = () => {
      mouse.x = null;
      mouse.y = null;
      setIsHovered(false);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseenter", () => setIsHovered(true));
    canvas.addEventListener("mouseleave", clearMouse);

    class Particle {
      constructor() {
        this.init();
      }
      init() {
        this.x = Math.random() * canvas.clientWidth;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.size = Math.random() * 1.5 + 0.5;
      }
      update() {
        const speed = isHovered ? 2.2 : 1;
        this.x += this.vx * speed;
        this.y += this.vy * speed;

        // VISSZAPATTANÁS - hogy ne ragadjon le az alján!
        if (this.x < 0 || this.x > canvas.clientWidth) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Kurzor eltolás (egér interakció)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 3;
            this.y -= (dy / dist) * force * 3;
          }
        }
      }
      draw() {
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = Array.from({ length: particleCount }, () => new Particle());
    };

    const connect = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < connectionDistance) {
            ctx.strokeStyle = `rgba(56,189,248,${(1 - dist / connectionDistance) * 0.5})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", clearMouse);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, height, isVisible, isHovered]);

  if (isMobile || !isVisible) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: `${height}px`,
        display: "block",
        background: "transparent",
        pointerEvents: "auto"
      }}
    />
  );
}

/* ================= DAILY SIGNAL & REGIONS ================= */
const DAILY_SIGNAL_KEY = "dailySignalUnlock";
function getTodayKey() { return new Date().toISOString().slice(0, 10); }

const REGIONS = [
  { code: "US", label: "United States" },
  { code: "EU", label: "European Union" },
  { code: "UK", label: "United Kingdom" },
  { code: "HU", label: "Hungary" },
  { code: "OTHER", label: "Other regions" },
];
export default function PremiumMonth() {
  const [isMobile, setIsMobile] = useState(false);
  const aiBoxRef = useRef(null);
  const [aiBoxHeight, setAiBoxHeight] = useState(0);

  // Automatikus régió felismerés és mobil detektálás
  const [region, setRegion] = useState("EU");
  useEffect(() => {
    setRegion(detectRegion());
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [simulationActive, setSimulationActive] = useState(false);
  const [stressFactor, setStressFactor] = useState(0);
  const [viewMode, setViewMode] = useState("executive");
  const [cycleDay, setCycleDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [aiVisible, setAiVisible] = useState(false);
  
  const [dailySignal, setDailySignal] = useState(null);
  const [dailyPending, setDailyPending] = useState(true);
  const [dailySnapshot, setDailySnapshot] = useState(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [exportRange, setExportRange] = useState("day");

  const [inputs, setInputs] = useState({
    income: 4000, housing: 1200, electricity: 120, gas: 90,
    water: 40, internet: 60, mobile: 40, tv: 30,
    insurance: 150, banking: 20, unexpected: 200, other: 300,
  });

  const [weeklyFocus, setWeeklyFocus] = useState(null);
  const [focusOpen, setFocusOpen] = useState(false);

  // Figyeljük az AI box magasságát, hogy a pókháló pontos legyen
  useEffect(() => {
    if (!isMobile && (aiVisible || simulationActive) && aiBoxRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          // Extra puffer (pl. 20px) az esztétikus kitöltéshez
          setAiBoxHeight(entry.contentRect.height + 20);
        }
      });
      observer.observe(aiBoxRef.current);
      return () => observer.disconnect();
    }
  }, [aiVisible, simulationActive, isMobile]);

  const calculateFragility = () => {
    const energy = (inputs.electricity + inputs.gas) * (1 + stressFactor);
    const fixed = inputs.housing + inputs.insurance + inputs.banking + energy;
    const ratio = (fixed / inputs.income) * 100;
    return Math.min(Math.max(ratio, 0), 100).toFixed(1);
  };

  const update = (key, value) => {
    setInputs({ ...inputs, [key]: Number(value) });
    setAiVisible(false);
  };

  const runAI = async () => {
    setLoading(true);
    setAiVisible(false);
    try {
      const res = await fetch("/api/get-ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, cycleDay, ...inputs }),
      });
      const json = await res.json();
      if (json?.snapshot) {
        setDailySnapshot(json.snapshot);
        setAiVisible(true);
        setSimulationActive(false);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div style={page}>
      {/* ... (Ticker és Header marad az eredeti) ... */}
      <div style={header}>
        <h1 style={title}>WEALTHYAI · MONTHLY BRIEFING</h1>
        <p style={subtitle}>Strategic financial outlook · Region: {region}</p>
      </div>

      <div style={layout}>
        {/* BAL OLDAL: Inputok és a dinamikus pókháló */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={card}>
            <h3>Financial Structure</h3>
            {/* Input mezők az eredeti logikáddal */}
            <Label>Income</Label>
            <Input value={inputs.income} onChange={e => update("income", e.target.value)} />
            <Divider />
            <button onClick={runAI} style={aiButton}>
              {loading ? "ANALYZING..." : "GENERATE AI STRATEGY"}
            </button>
            <button 
              onClick={() => { setSimulationActive(true); setAiVisible(false); }}
              style={{ ...exportBtn, width: "100%", marginTop: 10, borderColor: "#10b981" }}
            >
              RUN STRESS TEST
            </button>
          </div>

          {/* A PÓKHÁLÓ: Csak akkor jelenik meg, ha az AI doboz (aiVisible) 
              vagy a Szimuláció (simulationActive) aktív */}
          {(aiVisible || simulationActive) && !isMobile && (
            <div style={{ 
              borderRadius: 16, overflow: 'hidden', 
              background: "rgba(2,6,23,0.3)", border: "1px solid rgba(56,189,248,0.1)" 
            }}>
              <SpiderNet isMobile={isMobile} height={aiBoxHeight} isVisible={true} />
            </div>
          )}
        </div>

        {/* JOBB OLDAL: AI Válaszdoboz vagy Szimuláció */}
        <div style={card} ref={aiBoxRef}>
          {aiVisible ? (
            <div style={{ animation: "fadeIn 0.5s ease" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
                <button onClick={() => setViewMode("executive")} style={exportBtn}>Executive</button>
                <button onClick={() => setViewMode("directive")} style={exportBtn}>Directive</button>
              </div>
              <pre style={aiTextStyle}>
                {viewMode === "executive" ? dailySnapshot?.executive : dailySnapshot?.directive}
              </pre>
            </div>
          ) : simulationActive ? (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <h2 style={{ color: "#38bdf8" }}>Fragility Index: {calculateFragility()}%</h2>
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={stressFactor} 
                onChange={(e) => setStressFactor(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#38bdf8" }}
              />
              <p style={{ opacity: 0.7, marginTop: 15 }}>
                Adjust the slider to simulate economic pressure on your structural costs.
              </p>
            </div>
          ) : (
            <div style={{ opacity: 0.5, textAlign: "center", padding: "40px 0" }}>
              <p>WealthyAI interpretation engine idle.</p>
              <p style={{ fontSize: 12 }}>Enter your data and trigger the AI for strategic briefing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ... (Stílus objektumok: page, card, input, aiButton, stb. az eredeti verziódból)
/* ================= HELPER COMPONENTS ================= */
const Section = ({ title, children }) => (
  <>
    <Divider />
    <strong style={{fontSize: 14, color: "#7dd3fc", display: "block", marginBottom: 8}}>{title}</strong>
    {children}
  </>
);

const Row = ({ label, value, onChange }) => (
  <div style={row}>
    <span style={{fontSize: 13, opacity: 0.8}}>{label}</span>
    <input type="number" value={value} onChange={e => onChange(e.target.value)} style={rowInput} />
  </div>
);

const Label = ({ children }) => (
  <label style={{ marginBottom: 6, display: "block", fontSize: 13, opacity: 0.8 }}>{children}</label>
);

const Input = ({ value, onChange }) => (
  <input type="number" value={value} onChange={onChange} style={input} />
);

const Divider = () => (
  <div style={{ height: 1, background: "#1e293b", margin: "16px 0" }} />
);

/* ================= STYLE OBJECTS (Vizuális motor) ================= */
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
  backgroundAttachment: "fixed",
};

const header = { textAlign: "center", marginBottom: 20 };
const title = { fontSize: "2rem", margin: 0, fontWeight: "800", letterSpacing: "-0.02em", color: "#fff" };
const subtitle = { marginTop: 8, color: "#cbd5f5", fontSize: 14 };

const layout = { 
  display: "grid", 
  gridTemplateColumns: "1fr 1.3fr", 
  gap: 25, 
  maxWidth: 1100, 
  margin: "0 auto" 
};

const card = { 
  padding: 24, 
  borderRadius: 16, 
  border: "1px solid #1e293b", 
  background: "rgba(2,6,23,0.85)", 
  height: "fit-content",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
};

const input = { 
  width: "100%", padding: 12, marginTop: 4, 
  background: "rgba(255,255,255,0.05)", border: "1px solid #1e293b", 
  borderRadius: 8, color: "white", outline: "none" 
};

const row = { display: "flex", justifyContent: "space-between", marginTop: 10, alignItems: "center" };
const rowInput = { 
  width: 90, background: "transparent", border: "none", 
  borderBottom: "1px solid #38bdf8", color: "#38bdf8", 
  textAlign: "right", outline: "none", fontSize: 15, fontWeight: "500" 
};

const aiButton = { 
  marginTop: 20, width: "100%", padding: 14, 
  background: "linear-gradient(135deg, #38bdf8, #0ea5e9)", 
  border: "none", borderRadius: 10, fontWeight: "bold", 
  cursor: "pointer", color: "#020617", letterSpacing: "0.5px" 
};

const aiTextStyle = { 
  marginTop: 15, whiteSpace: "pre-wrap", color: "#cbd5f5", 
  fontSize: 14, lineHeight: "1.8", fontFamily: "'Inter', sans-serif",
  textAlign: "justify"
};

const exportBtn = { 
  padding: "8px 16px", borderRadius: 8, 
  border: "1px solid #1e293b", background: "rgba(56,189,248,0.05)", 
  color: "#38bdf8", cursor: "pointer", fontSize: 13, 
  transition: "all 0.2s ease" 
};

const footer = { 
  marginTop: 50, textAlign: "center", fontSize: 12, 
  color: "#64748b", paddingBottom: 30, letterSpacing: "1px" 
};

// CSS Animációk a tickerhez és a megjelenéshez
const globalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .ticker-text span { margin-right: 50px; }
`;
{/* ARCHÍVUM SZEKCIÓ - A doboz alatt */}
          <div style={{ marginTop: 15 }}>
            <button 
              onClick={() => setArchiveOpen(!archiveOpen)} 
              style={{ ...exportBtn, width: "100%", opacity: 0.8 }}
            >
              {archiveOpen ? "HIDE PREVIOUS DAYS" : "VIEW SNAPSHOT ARCHIVE"}
            </button>
            
            {archiveOpen && (
              <div style={{ 
                marginTop: 10, display: "flex", flexDirection: "column", 
                gap: 6, animation: "fadeIn 0.3s ease" 
              }}>
                {getMonthlySnapshots().map(s => (
                  <button
                    key={s.date}
                    onClick={() => { 
                      setSelectedDay(s.cycleDay); 
                      setDailySnapshot(s); // Betöltjük a régi adatot
                      setAiVisible(true); 
                      setSimulationActive(false); 
                    }}
                    style={{ 
                      ...exportBtn, textAlign: "left", fontSize: 12,
                      background: selectedDay === s.cycleDay ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.02)"
                    }}
                  >
                    Day {s.cycleDay} — {s.date} {selectedDay === s.cycleDay ? " (ACTIVE)" : ""}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* EXPORTÁLÁSI OPCIÓK - Csak ha van AI válasz */}
          {aiVisible && (
            <div style={{ 
              marginTop: 20, display: "flex", gap: 10, 
              flexWrap: "wrap", justifyContent: "center",
              animation: "fadeIn 0.4s ease"
            }}>
              <select 
                value={exportRange} 
                onChange={e => setExportRange(e.target.value)} 
                style={{ ...exportBtn, background: "#020617" }}
              >
                <option value="day">Today's Briefing</option>
                <option value="week">Past 7 Days</option>
                <option value="month">Full Month</option>
              </select>
              
              <button onClick={() => {
                const text = `WealthyAI Briefing - Day ${cycleDay}\nRegion: ${region}\n\n${viewMode === "executive" ? dailySnapshot?.executive : dailySnapshot?.directive}`;
                const blob = new Blob([text], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `wealthyai_day${cycleDay}.txt`;
                a.click();
              }} style={exportBtn}>TXT</button>

              <button onClick={async () => {
                // Itt hívjuk az API-t a PDF-hez
                const res = await fetch("/api/export-month-pdf", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ 
                    text: viewMode === "executive" ? dailySnapshot?.executive : dailySnapshot?.directive,
                    cycleDay, region 
                  }),
                });
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                window.open(url);
              }} style={exportBtn}>PDF</button>

              <button 
                disabled={emailSending}
                onClick={async () => {
                  setEmailSending(true);
                  await fetch("/api/send-month-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                      text: viewMode === "executive" ? dailySnapshot?.executive : dailySnapshot?.directive,
                      cycleDay, region 
                    }),
                  });
                  alert("Briefing sent to your email.");
                  setEmailSending(false);
                }} 
                style={exportBtn}
              >
                {emailSending ? "SENDING..." : "EMAIL"}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div style={footer}>
        © 2026 WealthyAI Intelligence Engine • {region} Node • Structural Integrity Confirmed
      </div>
    </div>
  );
}
