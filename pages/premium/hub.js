import React, { useState, useEffect } from "react";

export default function PremiumHub() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigateTo = (path) => {
    // 🔐 ELMENTJÜK A MESTER KÓDOT, HOGY A CÉLOLDAL BEENGEDJEN
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
      justifyContent: "center",
      padding: "20px",
      textAlign: "center",
      backgroundImage: "radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)",
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
      boxShadow: "0 0 20px rgba(251, 191, 36, 0.3)",
    },
    title: {
      fontSize: isMobile ? "2rem" : "2.8rem",
      marginBottom: "10px",
      fontWeight: "800",
    },
    subtitle: {
      opacity: 0.6,
      marginBottom: "50px",
      maxWidth: "500px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: "25px",
      width: "100%",
      maxWidth: "1100px",
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
      <div style={styles.masterBadge}>UNIVERSE MASTER ACCESS</div>
      <h1 style={styles.title}>WealthyAI Control Hub</h1>
      <p style={styles.subtitle}>
        Select the depth of intelligence you wish to occupy. 
        All systems are active.
      </p>

      <div style={styles.grid}>
        {/* DAILY */}
        <div 
          style={styles.card} 
          onClick={() => navigateTo("/premium-daily")}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.card)}
        >
          <div style={{ fontSize: "40px" }}>⚡</div>
          <h2 style={{ margin: 0 }}>Daily</h2>
          <p style={{ fontSize: "14px", opacity: 0.7 }}>Immediate Snapshots</p>
        </div>

        {/* WEEKLY */}
        <div 
          style={styles.card} 
          onClick={() => navigateTo("/premium-weekly")}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.card)}
        >
          <div style={{ fontSize: "40px" }}>📊</div>
          <h2 style={{ margin: 0 }}>Weekly</h2>
          <p style={{ fontSize: "14px", opacity: 0.7 }}>Behavioral Patterns</p>
        </div>

        {/* MONTHLY */}
        <div 
          style={styles.card} 
          onClick={() => navigateTo("/premium-month")}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.card)}
        >
          <div style={{ fontSize: "40px" }}>🧠</div>
          <h2 style={{ margin: 0 }}>Monthly</h2>
          <p style={{ fontSize: "14px", opacity: 0.7 }}>Full Strategy Engine</p>
        </div>
      </div>

      <button 
        onClick={() => navigateTo("/dashboard")}
        style={{
          marginTop: "60px",
          background: "none",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "white",
          padding: "12px 24px",
          borderRadius: "12px",
          cursor: "pointer",
          fontSize: "13px",
          opacity: 0.6
        }}
      >
        ← Back to Base Dashboard
      </button>
    </div>
  );
}
