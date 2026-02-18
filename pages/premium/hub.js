import React, { useState, useEffect } from "react";

export default function PremiumHub() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [stats, setStats] = useState({ 
    stripe: "CONNECTING...", 
    sendgrid: "CHECKING...",
    ph_status: "WARMING UP" 
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("wai_vip_token");
      
      // SZIGORÚ ELLENŐRZÉS: Csak a MASTER-DOMINANCE kódra nyílik meg az admin sáv
      const masterStatus = token === "MASTER-DOMINANCE-2026";
      setIsMaster(masterStatus);

      if (masterStatus) {
        fetch('/api/master-stats', {
          headers: { 'x-master-token': 'MASTER-DOMINANCE-2026' }
        })
        .then(res => res.json())
        .then(data => setStats({
          stripe: data.stripe || "ACTIVE",
          sendgrid: data.sendgrid || "READY",
          ph_status: "ENGAGED"
        }))
        .catch(() => setStats({ stripe: "OFFLINE", sendgrid: "ERROR", ph_status: "LIVE" }));
      }
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigateTo = (path) => {
    // Navigációnál megtartjuk a jelenlegi tokent, nem írjuk felül kényszerítve Masterre
    window.location.href = path;
  };

  const styles = {
    container: {
      minHeight: "100vh",
      width: "100%",
      backgroundColor: "#020617",
      color: "white",
      fontFamily: "Inter, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: isMobile ? "0 10px 40px 10px" : "0 20px 40px 20px",
      textAlign: "center",
      backgroundImage: "radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)",
      boxSizing: "border-box",
      overflowX: "hidden"
    },
    adminBar: {
      width: "100%",
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #f59e0b50",
      padding: isMobile ? "20px 15px" : "12px 20px",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      position: "sticky",
      top: 0,
      zIndex: 100,
      marginBottom: isMobile ? "20px" : "40px",
      gap: isMobile ? "20px" : "15px",
      boxSizing: "border-box"
    },
    statusGroup: {
      display: "flex",
      gap: isMobile ? "15px" : "25px",
      fontSize: "10px",
      fontFamily: "monospace",
      textAlign: "center",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    adminBtnGroup: {
      display: "flex", 
      gap: "6px", 
      flexWrap: "wrap", 
      justifyContent: "center",
      width: isMobile ? "100%" : "auto"
    },
    adminBtn: {
      padding: "8px 12px",
      borderRadius: "6px",
      fontSize: "9px",
      fontWeight: "bold",
      textDecoration: "none",
      color: "white",
      border: "1px solid rgba(255,255,255,0.1)",
      transition: "0.2s",
      whiteSpace: "nowrap",
      boxSizing: "border-box",
      textTransform: "uppercase"
    },
    masterBadge: {
      background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
      color: "#000",
      padding: "5px 15px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "bold",
      letterSpacing: "2px",
      marginBottom: "20px",
      marginTop: isMobile ? "40px" : "20px",
      boxShadow: "0 0 20px rgba(251, 191, 36, 0.3)",
    },
    title: {
      fontSize: isMobile ? "1.8rem" : "2.8rem",
      marginBottom: "10px",
      fontWeight: "800",
      padding: "0 10px",
      boxSizing: "border-box",
      maxWidth: "100%"
    },
    grid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: "20px",
      width: "100%",
      maxWidth: "1100px",
      marginTop: "30px",
      padding: "0 10px",
      boxSizing: "border-box"
    },
    card: {
      background: "rgba(30, 41, 59, 0.4)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "24px",
      padding: isMobile ? "25px 15px" : "40px 30px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "12px",
      boxSizing: "border-box",
      width: "100%"
    },
    cardHover: {
      border: "1px solid rgba(99, 102, 241, 0.6)",
      background: "rgba(30, 41, 59, 0.7)",
      transform: "translateY(-5px)",
    }
  };

  return (
    <div style={styles.container}>
      
      {/* CSAK HA MASTER VAGY, AKKOR LÁTOD AZ ADMIN SÁVOT */}
      {isMaster && (
        <div style={styles.adminBar}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ 
              width: "8px", height: "8px", borderRadius: "50%", 
              backgroundColor: stats.stripe !== "OFFLINE" ? "#22c55e" : "#ef4444", 
              boxShadow: stats.stripe !== "OFFLINE" ? "0 0 10px #22c55e" : "0 0 10px #ef4444" 
            }}></div>
            <span style={{ fontSize: "10px", fontWeight: "bold", color: "#f59e0b", letterSpacing: "1px" }}>WAI MASTER SYSTEM</span>
          </div>

          <div style={styles.statusGroup}>
            <div>
              <div style={{ color: "#64748b" }}>STRIPE</div>
              <div style={{ color: stats.stripe.includes('ERROR') ? "#ef4444" : "#22c55e" }}>{stats.stripe}</div>
            </div>
            <div>
              <div style={{ color: "#64748b" }}>PH STATUS</div>
              <div style={{ color: "#fbbf24" }}>{stats.ph_status}</div>
            </div>
            <div>
              <div style={{ color: "#64748b" }}>TRAFFIC</div>
              <div style={{ color: "#3b82f6" }}>LIVE</div>
            </div>
          </div>

          <div style={styles.adminBtnGroup}>
            <a href="https://dash.cloudflare.com/d0303d7c50394b280a28b58d33c13f11/home/domains" target="_blank" rel="noreferrer" style={{ ...styles.adminBtn, backgroundColor: "#f38020" }}>CLOUDFLARE</a>
            <a href="https://www.producthunt.com/@zoltan_horvath5" target="_blank" rel="noreferrer" style={{ ...styles.adminBtn, backgroundColor: "#da552f" }}>PH PROFIL</a>
            <a href="https://mail.zoho.eu" target="_blank" rel="noreferrer" style={{ ...styles.adminBtn, backgroundColor: "#1e3a8a" }}>ZOHO</a>
            <a href="https://www.linkedin.com/in/zoltan-horvath-77386a3a9/?locale=hu" target="_blank" rel="noreferrer" style={{ ...styles.adminBtn, backgroundColor: "#0a66c2" }}>LINKEDIN</a>
            <a href="https://vercel.com/donation-website-projects/wealthyai-web/analytics" target="_blank" rel="noreferrer" style={{ ...styles.adminBtn, backgroundColor: "#000000" }}>ANALYTICS</a>
            <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer" style={{ ...styles.adminBtn, backgroundColor: "#4338ca" }}>STRIPE</a>
            <a href="https://portal.azure.com/#home" target="_blank" rel="noreferrer" style={{ ...styles.adminBtn, backgroundColor: "#2563eb" }}>AZURE</a>
          </div>
        </div>
      )}

      <div style={styles.masterBadge}>UNIVERSE MASTER ACCESS</div>
      <h1 style={styles.title}>WealthyAI Control Hub</h1>
      
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
