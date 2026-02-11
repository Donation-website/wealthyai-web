import React, { useState, useEffect } from "react";

export default function PremiumHub() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMaster, setIsMaster] = useState(false);

  useEffect(() => {
    // Mobil nézet figyelése
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    
    // Master jogosultság ellenőrzése
    if (typeof window !== 'undefined') {
      setIsMaster(localStorage.getItem("wai_vip_token") === "MASTER-DOMINANCE-2026");
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigateTo = (path) => {
    localStorage.setItem("wai_vip_token", "MASTER-DOMINANCE-2026");
    window.location.href = path;
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#020617",
      color: "white",
      fontFamily: "Inter, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 20px 40px 20px",
      textAlign: "center",
      backgroundImage: "radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)",
    },
    // --- ÚJ MASTER DASHBOARD STÍLUSOK ---
    adminBar: {
      width: "100%",
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid #f59e0b50",
      padding: "12px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "sticky",
      top: 0,
      zIndex: 100,
      marginBottom: "40px",
    },
    statusGroup: {
      display: "flex",
      gap: "20px",
      fontSize: "10px",
      fontFamily: "monospace",
      textAlign: "left",
    },
    adminBtn: {
      padding: "6px 12px",
      borderRadius: "6px",
      fontSize: "10px",
      fontWeight: "bold",
      textDecoration: "none",
      color: "white",
      border: "1px solid rgba(255,255,255,0.1)",
      transition: "0.2s",
    },
    // --- EREDETI STÍLUSOK ---
    masterBadge: {
      background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
      color: "#000",
      padding: "5px 15px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "bold",
      letterSpacing: "2px",
      marginBottom: "20px",
      marginTop: "20px",
      boxShadow: "0 0 20px rgba(251, 191, 36, 0.3)",
    },
    title: {
      fontSize: isMobile ? "2rem" : "2.8rem",
      marginBottom: "10px",
      fontWeight: "800",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: "25px",
      width: "100%",
      maxWidth: "1100px",
      marginTop: "40px",
    },
    card: {
      background: "rgba(30, 41, 59, 0.4)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "24px",
      padding: "40px 30px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "15px",
    },
    cardHover: {
      border: "1px solid rgba(99, 102, 241, 0.6)",
      background: "rgba(30, 41, 59, 0.7)",
      transform: "translateY(-5px)",
    }
  };

  return (
    <div style={styles.container}>
      
      {/* 👑 MASTER COMMAND CENTER - Csak neked jelenik meg */}
      {isMaster && (
        <div style={styles.adminBar}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e", boxShadow: "0 0 10px #22c55e" }}></div>
            <span style={{ fontSize: "10px", fontWeight: "bold", color: "#f59e0b", letterSpacing: "1px" }}>WAI MASTER SYSTEM</span>
          </div>

          <div style={styles.statusGroup}>
            <div>
              <div style={{ color: "#64748b" }}>STRIPE STATUS</div>
              <div style={{ color: "#22c55e" }}>CONNECTED</div>
            </div>
            <div>
              <div style={{ color: "#64748b" }}>SENDGRID RELAY</div>
              <div style={{ color: "#3b82f6" }}>READY (ACTIVE)</div>
            </div>
            {!isMobile && (
               <div>
                 <div style={{ color: "#64748b" }}>SESSION</div>
                 <div style={{ color: "#fff" }}>MASTER_DOM_2026</div>
               </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <a href="https://mail.zoho.eu" target="_blank" rel="noreferrer" style={{ ...styles.adminBtn, backgroundColor: "#1e3a8a" }}>ZOHO</a>
            <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer" style={{ ...styles.adminBtn, backgroundColor: "#4338ca" }}>STRIPE</a>
            <a href="https://vercel.com" target="_blank" rel="noreferrer" style={{ ...styles.adminBtn, backgroundColor: "#1e293b" }}>VERCEL</a>
          </div>
        </div>
      )}

      <div style={styles.masterBadge}>UNIVERSE MASTER ACCESS</div>
      <h1 style={styles.title}>WealthyAI Control Hub</h1>
      <p style={{ opacity: 0.6, marginBottom: "50px", maxWidth: "500px" }}>
        Select the depth of intelligence you wish to occupy. All systems are active.
      </p>

      <div style={styles.grid}>
        <div style={styles.card} onClick={() => navigateTo("/day")}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.card)}>
          <div style={{ fontSize: "40px" }}>⚡</div>
          <h2 style={{ margin: 0 }}>Daily</h2>
          <p style={{ fontSize: "14px", opacity: 0.7 }}>Immediate Snapshots</p>
        </div>

        <div style={styles.card} onClick={() => navigateTo("/premium-week")}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.card)}>
          <div style={{ fontSize: "40px" }}>📊</div>
          <h2 style={{ margin: 0 }}>Weekly</h2>
          <p style={{ fontSize: "14px", opacity: 0.7 }}>Behavioral Patterns</p>
        </div>

        <div style={styles.card} onClick={() => navigateTo("/premium-month")}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.card)}>
          <div style={{ fontSize: "40px" }}>🧠</div>
          <h2 style={{ margin: 0 }}>Monthly</h2>
          <p style={{ fontSize: "14px", opacity: 0.7 }}>Full Strategy Engine</p>
        </div>
      </div>

      <button onClick={() => navigateTo("/")}
        style={{ marginTop: "60px", background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "12px 24px", borderRadius: "12px", cursor: "pointer", fontSize: "13px", opacity: 0.6 }}>
        ← Back to Base Dashboard
      </button>
    </div>
  );
}
