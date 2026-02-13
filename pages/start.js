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

  /* ===== VIP ACCESS STATES ===== */
  const [showVipInput, setShowVipInput] = useState(false);
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

  /* ===== VIP SUBMIT HANDLER (IDŐBÉLYEGGEL ÉS SZINT-FIGYELŐVEL) ===== */

  const handleVipSubmit = async () => {
    if (!vipCode.trim()) return;
    
    try {
      // Meghívjuk az API-t az ellenőrzéshez
      const res = await fetch("/api/verify-priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          vipCode: vipCode.trim(),
          financials: data 
        }),
      });

      const result = await res.json();

      if (result.active) {
        // Alap kód mentése
        localStorage.setItem("wai_vip_token", vipCode.trim());

        // IDŐBÉLYEG RÖGZÍTÉSE CSAK GUEST SZINTNÉL
        if (result.level === "guest") {
          const now = new Date();
          const expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          
          localStorage.setItem("wai_vip_activated_at", now.toISOString());
          localStorage.setItem("wai_vip_expiry", expiryDate.toISOString());
        } else {
          // Ha Master (vagy egyéb), töröljük a korlátozást
          localStorage.removeItem("wai_vip_expiry");
          localStorage.removeItem("wai_vip_activated_at");
        }

        // Átirányítás
        window.location.href = result.redirectPath || "/premium-month";
      } else {
        alert("Invalid or expired priority code.");
      }
    } catch (err) {
      alert("Verification failed. Please try again.");
    }
  };

  /* ===== STRIPE (PRICE IDs UPDATED) ===== */

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
            </div>

            <div style={card}>
              <h3>Insights (Basic)</h3>
              <Radar data={radar} />

              <p>
                Risk Level: <strong>{riskLevel}</strong>
              </p>
              <p style={{ marginBottom: 15 }}>
                Savings Score: <strong>{savingsScore}/100</strong>
              </p>

              <ul style={{ paddingLeft: 20 }}>
                {insights.map((i, idx) => (
                  <li key={idx} style={{ marginBottom: 12, fontSize: "14px" }}>
                    {i}
                  </li>
                ))}
              </ul>

              <p style={{ opacity: 0.65, marginTop: 18, fontSize: "12px" }}>
                This view shows a snapshot — not behavior, not direction.
              </p>
              <p
                onClick={() =>
                  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })
                }
                style={{
                  marginTop: 10,
                  fontSize: "12px",
                  opacity: 0.5,
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                Daily / Weekly / Monthly intelligence available ↓
              </p>
            </div>
          </div>

          <div style={{ marginTop: isMobile ? 40 : 70, textAlign: "center" }}>
            <h2
              className="pulse-title"
              style={{ fontSize: isMobile ? "1.4rem" : "2rem" }}
            >
              Choose your depth of financial intelligence
            </h2>

            <p
              style={{
                maxWidth: 700,
                margin: "18px auto",
                opacity: 0.85,
                fontSize: isMobile ? "14px" : "16px",
              }}
            >
              Different questions require different levels of context.
              You can choose the depth that matches what you want to understand right now.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 20,
                marginTop: 30,
              }}
            >
              <div style={card}>
                <h4>Daily Intelligence</h4>
                <p style={{ fontSize: "14px", opacity: 0.8 }}>
                  Short-term interpretation of your current financial state.
                  Best for immediate clarity.
                </p>
              </div>

              <div style={card}>
                <h4>Weekly Intelligence</h4>
                <p style={{ fontSize: "14px", opacity: 0.8 }}>
                  Behavior patterns across days and categories.
                  Best for understanding habits.
                </p>
              </div>

              <div style={card}>
                <h4>Monthly Intelligence</h4>
                <p style={{ fontSize: "14px", opacity: 0.8 }}>
                  Multi-week context, regional insights, and forward-looking analysis.
                  Best when decisions require direction.
                </p>
              </div>
            </div>
          </div>

          <div
            id="pricing"
            style={{ marginTop: isMobile ? 40 : 60 }}
          >
            <h2
              style={{
                textAlign: "center",
                marginBottom: 10,
                fontSize: isMobile ? "1.4rem" : "2rem",
              }}
            >
              Unlock Advanced AI Intelligence
            </h2>

            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "12px", 
              marginBottom: 30,
              fontSize: isMobile ? "14px" : "16px",
              opacity: 0.9,
              flexWrap: "wrap"
            }}>
              <span style={{ color: "#10b981", fontWeight: "600" }}>Strict Data Privacy</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>Secure transaction processed via</span>
              <img 
                src="/wealthyai/icons/stripe.png" 
                alt="Stripe" 
                style={{ height: "35px", width: "auto", display: "inline-block" }} 
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <div
                style={priceCard}
                onClick={() =>
                  handleCheckout("price_1SsRVyDyLtejYlZi3fEwvTPW")
                }
              >
                <h3>1 Day · $9.99</h3>
                <small>Immediate clarity</small>
              </div>

              <div
                style={priceCard}
                onClick={() =>
                  handleCheckout("price_1SsRY1DyLtejYlZiglvFKufA")
                }
              >
                <h3>1 Week · $14.99</h3>
                <small>Behavior & patterns</small>
              </div>

              <div style={{ ...priceCard, cursor: "default" }}>
                <div 
                  onClick={() => handleCheckout("price_1Sya6GDyLtejYlZiCb8oLqga")}
                  style={{ cursor: "pointer" }}
                >
                  <h3>1 Month · $49.99</h3>
                  <small>Full intelligence engine</small>
                </div>

                <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowVipInput(!showVipInput); }}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: "10px", cursor: "pointer", letterSpacing: "0.05em" }}
                  >
                    {showVipInput ? "CLOSE PRIORITY" : "HAVE A PRIORITY CODE?"}
                  </button>
                  
                  {showVipInput && (
                    <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <input 
                        type="text" 
                        value={vipCode}
                        onChange={(e) => setVipCode(e.target.value)}
                        placeholder="Enter code"
                        style={{ ...input, textAlign: "center", fontSize: "12px", padding: "6px", background: "rgba(255,255,255,0.04)" }}
                      />
                      <button 
                        onClick={handleVipSubmit}
                        style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "white", borderRadius: "6px", padding: "6px", fontSize: "11px", cursor: "pointer" }}
                      >
                        VALIDATE
                      </button>
                      {/* VISSZAJELZÉS HA AKTÍV A KÓD */}
                      {typeof window !== 'undefined' && localStorage.getItem("wai_vip_expiry") && (
                        <div style={{ fontSize: "10px", color: "#10b981", marginTop: "5px" }}>
                          Access active until: {new Date(localStorage.getItem("wai_vip_expiry")).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ 
          marginTop: "50px", 
          textAlign: "center", 
          paddingBottom: "20px" 
        }}>
          <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            © 2026 WealthyAI — All rights reserved.
          </div>
        </div>

        <style>{`
          .pulse-title {
            animation: pulseSoft 3s ease-in-out infinite;
          }
          @keyframes pulseSoft {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
          @keyframes waiScroll {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>
      </main>
    </>
  );
}
