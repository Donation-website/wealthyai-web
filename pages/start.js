import React, { useState, useEffect } from "react";

export default function UserDashboard() {
  const [data, setData] = useState({
    income: 5000,
    fixed: 2000,
    variable: 1500,
    electricity: 150,
    water: 50,
    gas: 100,
    internet: 80,
    subscriptions: 120,
  });

  /* ===== ACCESS STATES ===== */
  const [showVipInput, setShowVipInput] = useState(false);
  const [showDayInput, setShowDayInput] = useState(false);
  const [showWeekInput, setShowWeekInput] = useState(false);
  
  /* Codes for each tier */
  const [dayCode, setDayCode] = useState("");
  const [weekCode, setWeekCode] = useState("");
  const [vipCode, setVipCode] = useState("");

  /* ===== MOBILE DETECTION ===== */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ===== CALCULATIONS ===== */

  const totalExpenses = data.fixed + data.variable;
  const balance = data.income - totalExpenses;

  const usagePercent =
    data.income > 0 
      ? Math.min((totalExpenses / data.income) * 100, 100) 
      : (totalExpenses > 0 ? 100 : 0);

  const savingsRate =
    data.income > 0 ? (balance / data.income) * 100 : (balance < 0 ? -100 : 0);

  const savingsScore = Math.max(
    0,
    Math.min(100, Math.round((savingsRate / 30) * 100))
  );

  const riskLevel =
    (usagePercent > 90 || balance < 0 || (data.income === 0 && totalExpenses > 0))
      ? "High Risk"
      : usagePercent > 70
      ? "Medium Risk"
      : "Low Risk";

  /* ===== INSIGHTS ===== */

  const insights = [];

  if (balance < 0) {
    insights.push(
      "Your expenses exceed your income. Immediate action may be required."
    );
  }

  if (data.subscriptions > data.income * 0.08) {
    insights.push(
      "Subscriptions appear high. Reviewing unused services may free up cash."
    );
  }

  if (savingsRate >= 20) {
    insights.push(
      "You are saving at a healthy rate, supporting long-term stability."
    );
  } else if (balance >= 0) {
    insights.push(
      "Your savings rate is modest. Small adjustments could improve resilience."
    );
  }

  /* ===== UNIVERSAL VALIDATE HANDLER ===== */

  const handleVerify = async (code, type) => {
    if (!code.trim()) return;
    
    try {
      const res = await fetch("/api/verify-priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          vipCode: code.trim(),
          financials: data,
          tier: type 
        }),
      });

      const result = await res.json();

      if (result.active) {
        localStorage.setItem(`wai_${type}_token`, code.trim());
        window.location.href = result.redirectPath || `/premium-${type}`;
      } else {
        alert("Invalid or expired priority code.");
      }
    } catch (err) {
      alert("Verification failed. Please try again.");
    }
  };

  /* ===== STRIPE ===== */

  const handleCheckout = async (priceId) => {
    localStorage.setItem("userFinancials", JSON.stringify(data));

    if (priceId === "price_1Sya6GDyLtejYlZiCb8oLqga") {
      const hasHadMonth = localStorage.getItem("hadMonthSubscription");
      if (hasHadMonth) {
        localStorage.setItem("isReturningMonthCustomer", "true");
      }
    }

    try {
      const res = await fetch("/api/create-stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const session = await res.json();
      if (session.url) window.location.href = session.url;
      else alert("Payment initialization failed.");
    } catch {
      alert("Payment initialization failed.");
    }
  };


  /* ===== RADAR DATA ===== */

  const radar = [
    { label: "Expense Load", value: usagePercent },
    { label: "Savings Strength", value: Math.min(100, Math.max(0, savingsRate * 3)) },
    {
      label: "Subscription Weight",
      value:
        data.income > 0
          ? Math.min((data.subscriptions / data.income) * 200, 100)
          : (data.subscriptions > 0 ? 100 : 0),
    },
  ];

  /* ===== RADAR COMPONENT ===== */

  const Radar = ({ data, size = isMobile ? 180 : 200 }) => {
    const c = size / 2;
    const r = size / 2 - 24;
    const step = (Math.PI * 2) / data.length;

    const clamp = (v) => Math.max(0, Math.min(100, v));

    const point = (val, i) => {
      const a = i * step - Math.PI / 2;
      const rr = (clamp(val) / 100) * r;
      return [c + rr * Math.cos(a), c + rr * Math.sin(a)];
    };

    return (
      <svg
        width={size}
        height={size}
        style={{ display: "block", margin: "20px auto", overflow: "visible" }}
      >
        {[0.25, 0.5, 0.75, 1].map((lvl, i) => (
          <circle
            key={i}
            cx={c}
            cy={c}
            r={r * lvl}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
          />
        ))}

        {data.map((_, i) => {
          const a = i * step - Math.PI / 2;
          return (
            <line
              key={i}
              x1={c}
              y1={c}
              x2={c + r * Math.cos(a)}
              y2={c + r * Math.sin(a)}
              stroke="rgba(255,255,255,0.18)"
            />
          );
        })}

        <polygon
          points={data.map((d, i) => point(d.value, i).join(",")).join(" ")}
          fill="rgba(99,102,241,0.35)"
          stroke="rgba(99,102,241,0.9)"
        />

        {data.map((d, i) => {
          const a = i * step - Math.PI / 2;
          return (
            <text
              key={i}
              x={c + (r + 14) * Math.cos(a)}
              y={c + (r + 14) * Math.sin(a)}
              fontSize="11"
              fill="rgba(255,255,255,0.7)"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    );
  };

  /* ===== STYLES ===== */

  const card = {
    background: "rgba(15,23,42,0.65)",
    backdropFilter: "blur(14px)",
    borderRadius: "22px",
    padding: isMobile ? "20px" : "26px",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  const input = {
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    borderRadius: "8px",
    border: "none",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    boxSizing: "border-box",
  };

  const priceCard = {
    ...card,
    textAlign: "center",
    cursor: "pointer",
    flex: isMobile ? "1 1 100%" : "0 1 240px",
  };

  const gateInput = { 
    background: "rgba(255,255,255,0.05)", 
    border: "1px solid rgba(255,255,255,0.1)", 
    borderRadius: "8px", 
    padding: "10px", 
    color: "white", 
    fontSize: "13px", 
    textAlign: "center", 
    width: "100%", 
    outline: "none",
    boxSizing: "border-box"
  };

  const gateBtn = { 
    background: "rgba(99,102,241,0.2)", 
    border: "1px solid rgba(99,102,241,0.4)", 
    color: "white", 
    borderRadius: "8px", 
    padding: "10px", 
    fontSize: "12px", 
    fontWeight: "600", 
    cursor: "pointer", 
    width: "100%", 
    textTransform: "uppercase", 
    letterSpacing: "0.05em",
    marginTop: "8px"
  };

  const helpButton = {
    position: "absolute",
    top: isMobile ? 15 : 24,
    right: isMobile ? 15 : 24,
    padding: "8px 14px",
    borderRadius: 10,
    fontSize: 13,
    textDecoration: "none",
    color: "#7dd3fc",
    border: "1px solid #1e293b",
    background: "rgba(2,6,23,0.6)",
    zIndex: 15,
  };

  const WealthyTicker = () => {
    if (isMobile) return null;

    const tickerText = "WealthyAI interprets your financial state over time — not advice, not prediction, just clarity • Interpretation over advice • Clarity over certainty • Insight unfolds over time • Financial understanding isn’t instant • Context changes • Insight follows time • Clarity over certainty • Built on time, not urgency • ";

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

  return (
    <>
      <main
        style={{
          minHeight: "100vh",
          position: "relative",
          padding: isMobile ? "20px 15px" : "40px",
          color: "white",
          fontFamily: "Inter, system-ui, sans-serif",
          backgroundColor: "#020617",
          backgroundImage: `
            repeating-linear-gradient(-25deg, rgba(56,189,248,0.07) 0px, rgba(56,189,248,0.07) 1px, transparent 1px, transparent 160px),
            repeating-linear-gradient(35deg, rgba(167,139,250,0.06) 0px, rgba(167,139,250,0.06) 1px, transparent 1px, transparent 220px),
            radial-gradient(circle at 20% 30%, rgba(56,189,248,0.22), transparent 40%),
            radial-gradient(circle at 80% 60%, rgba(167,139,250,0.22), transparent 45%),
            radial-gradient(circle at 45% 85%, rgba(34,211,238,0.18), transparent 40%),
            url("/wealthyai/icons/generated.png")
          `,
          backgroundRepeat:
            "repeat, repeat, no-repeat, no-repeat, no-repeat, repeat",
          backgroundSize:
            "auto, auto, 100% 100%, 100% 100%, 100% 100%, 420px auto",
          backgroundAttachment: "fixed",
        }}
      >
        <WealthyTicker />

        <a href="/start/help" style={helpButton}>Help</a>

        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h1 style={{ fontSize: isMobile ? "1.8rem" : "2.5rem" }}>
              Your Financial Overview (Basic)
            </h1>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 20,
            }}
          >
            <div style={card}>
              <h3>Income & Expenses</h3>

              {[
                ["Monthly Income ($)", "income"],
                ["Fixed Expenses", "fixed"],
                ["Variable Expenses", "variable"],
              ].map(([label, key]) => (
                <div key={key} style={{ marginBottom: 15 }}>
                  <label style={{ fontSize: "14px" }}>{label}</label>
                  <input
                    type="number"
                    value={data[key]}
                    style={input}
                    onChange={(e) =>
                      setData({ ...data, [key]: Number(e.target.value) })
                    }
                  />
                </div>
              ))}
              
              <div style={{ marginTop: 20 }}>
                <h4 style={{ fontSize: "14px", marginBottom: 10, opacity: 0.8 }}>Additional Utilities</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {[['Electricity', 'electricity'], ['Water', 'water'], ['Gas', 'gas'], ['Internet', 'internet']].map(([l, k]) => (
                        <div key={k}>
                            <label style={{ fontSize: "11px", opacity: 0.6 }}>{l}</label>
                            <input type="number" value={data[k]} style={{ ...input, padding: "6px" }} onChange={(e) => setData({...data, [k]: Number(e.target.value)})} />
                        </div>
                    ))}
                </div>
              </div>
            </div>

            <div style={card}>
              <h3>Insights (Basic)</h3>
              <Radar data={radar} />

              <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <p style={{ margin: "5px 0" }}>
                    Risk Level: <strong style={{ color: riskLevel === "High Risk" ? "#ef4444" : "#10b981" }}>{riskLevel}</strong>
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    Savings Score: <strong>{savingsScore}/100</strong>
                  </p>
              </div>

              <div style={{ background: "rgba(0,0,0,0.2)", padding: "15px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {insights.map((i, idx) => (
                      <li key={idx} style={{ marginBottom: 10, fontSize: "13px", lineHeight: "1.4", opacity: 0.9 }}>
                        {i}
                      </li>
                    ))}
                  </ul>
              </div>

              <p style={{ opacity: 0.5, marginTop: 18, fontSize: "11px", textAlign: "center", fontStyle: "italic" }}>
                This view shows a static snapshot of your current inputs.
              </p>
            </div>
          </div>

          {/* DEPTH EXPLANATION */}
          <div style={{ marginTop: 80, textAlign: "center" }}>
            <h2 className="pulse-title" style={{ fontSize: isMobile ? "1.5rem" : "2.2rem", fontWeight: "700" }}>
              Choose your depth of financial intelligence
            </h2>
            <p style={{ maxWidth: 700, margin: "20px auto", opacity: 0.8, lineHeight: "1.6" }}>
              Our AI models provide different layers of context based on the timeframe. 
              Select the depth that matches your current investigative needs.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 25, marginTop: 40 }}>
                <div style={card}>
                    <div style={{ height: 40, width: 40, background: "rgba(56,189,248,0.2)", borderRadius: "10px", margin: "0 auto 15px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#38bdf8" }}>D</span>
                    </div>
                    <h4 style={{ marginBottom: 10 }}>Daily</h4>
                    <p style={{ fontSize: "13px", opacity: 0.7 }}>Immediate, granular interpretation of your current state.</p>
                </div>
                <div style={card}>
                    <div style={{ height: 40, width: 40, background: "rgba(167,139,250,0.2)", borderRadius: "10px", margin: "0 auto 15px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#a78bfa" }}>W</span>
                    </div>
                    <h4 style={{ marginBottom: 10 }}>Weekly</h4>
                    <p style={{ fontSize: "13px", opacity: 0.7 }}>Pattern recognition and behavioral habit analysis.</p>
                </div>
                <div style={card}>
                    <div style={{ height: 40, width: 40, background: "rgba(34,211,238,0.2)", borderRadius: "10px", margin: "0 auto 15px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#22d3ee" }}>M</span>
                    </div>
                    <h4 style={{ marginBottom: 10 }}>Monthly</h4>
                    <p style={{ fontSize: "13px", opacity: 0.7 }}>Strategic direction, regional context, and long-term trajectory.</p>
                </div>
            </div>
          </div>

          {/* PRICING GATE SECTION */}
          <div id="pricing" style={{ marginTop: 100, paddingBottom: 100 }}>
            <h2 style={{ textAlign: "center", marginBottom: 10, fontSize: "2rem" }}>Unlock Advanced AI Intelligence</h2>
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: 40, opacity: 0.8 }}>
              <span style={{ color: "#10b981", fontSize: "14px" }}>Strict Data Privacy</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span style={{ fontSize: "14px" }}>Secure via</span>
              <img src="/wealthyai/icons/stripe.png" alt="Stripe" style={{ height: "30px" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 25, flexWrap: "wrap" }}>
              
              {/* DAY GATE */}
              <div style={{ ...priceCard, cursor: "default" }}>
                <div onClick={() => handleCheckout("price_1SsRVyDyLtejYlZi3fEwvTPW")} style={{ cursor: "pointer" }}>
                  <h3 style={{ fontSize: "1.4rem", marginBottom: 5 }}>1 Day · $9.99</h3>
                  <p style={{ fontSize: "14px", opacity: 0.6 }}>Immediate clarity</p>
                </div>

                <div style={{ marginTop: 30, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20 }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowDayInput(!showDayInput); }}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: "11px", cursor: "pointer", letterSpacing: "0.05em" }}
                  >
                    {showDayInput ? "CLOSE ACCESS" : "ACCESS WITH DAY PASS?"}
                  </button>
                  
                  {showDayInput && (
                    <div style={{ marginTop: 15, display: "flex", flexDirection: "column", gap: "10px" }}>
                      <input 
                        type="text" 
                        value={dayCode}
                        onChange={(e) => setDayCode(e.target.value)}
                        placeholder="Enter code"
                        style={gateInput}
                      />
                      <button 
                        onClick={() => handleVerify(dayCode, "day")}
                        style={gateBtn}
                      >
                        Validate Access
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* WEEK GATE */}
              <div style={{ ...priceCard, cursor: "default" }}>
                <div onClick={() => handleCheckout("price_1SsRY1DyLtejYlZiglvFKufA")} style={{ cursor: "pointer" }}>
                  <h3 style={{ fontSize: "1.4rem", marginBottom: 5 }}>1 Week · $14.99</h3>
                  <p style={{ fontSize: "14px", opacity: 0.6 }}>Behavior & patterns</p>
                </div>

                <div style={{ marginTop: 30, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20 }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowWeekInput(!showWeekInput); }}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: "11px", cursor: "pointer", letterSpacing: "0.05em" }}
                  >
                    {showWeekInput ? "CLOSE ACCESS" : "ACCESS WITH WEEK PASS?"}
                  </button>
                  
                  {showWeekInput && (
                    <div style={{ marginTop: 15, display: "flex", flexDirection: "column", gap: "10px" }}>
                      <input 
                        type="text" 
                        value={weekCode}
                        onChange={(e) => setWeekCode(e.target.value)}
                        placeholder="Enter code"
                        style={gateInput}
                      />
                      <button 
                        onClick={() => handleVerify(weekCode, "week")}
                        style={gateBtn}
                      >
                        Validate Access
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* MONTH GATE (ORIGINAL) */}
              <div style={{ ...priceCard, cursor: "default" }}>
                <div onClick={() => handleCheckout("price_1Sya6GDyLtejYlZiCb8oLqga")} style={{ cursor: "pointer" }}>
                  <h3 style={{ fontSize: "1.4rem", marginBottom: 5 }}>1 Month · $49.99</h3>
                  <p style={{ fontSize: "14px", opacity: 0.6 }}>Full intelligence engine</p>
                </div>

                <div style={{ marginTop: 30, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20 }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowVipInput(!showVipInput); }}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: "11px", cursor: "pointer", letterSpacing: "0.05em" }}
                  >
                    {showVipInput ? "CLOSE PRIORITY" : "HAVE A PRIORITY CODE?"}
                  </button>
                  
                  {showVipInput && (
                    <div style={{ marginTop: 15, display: "flex", flexDirection: "column", gap: "10px" }}>
                      <input 
                        type="text" 
                        value={vipCode}
                        onChange={(e) => setVipCode(e.target.value)}
                        placeholder="Enter code"
                        style={gateInput}
                      />
                      <button 
                        onClick={() => handleVerify(vipCode, "month")}
                        style={gateBtn}
                      >
                        Validate
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer style={{ textAlign: "center", padding: "40px 0", borderTop: "1px solid rgba(255,255,255,0.05)", opacity: 0.6, fontSize: "12px" }}>
            <p>© 2026 WealthyAI Intelligence Systems. All analytical results are interpretations, not financial advice.</p>
            <div style={{ marginTop: 15, display: "flex", justifyContent: "center", gap: 20 }}>
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Support</span>
            </div>
        </footer>

        <style>{`
          .pulse-title {
            animation: pulseSoft 4s ease-in-out infinite;
          }
          @keyframes pulseSoft {
            0%, 100% { opacity: 0.7; transform: scale(0.99); }
            50% { opacity: 1; transform: scale(1); }
          }
          @keyframes waiScroll {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
        `}</style>
      </main>
    </>
  );
}
