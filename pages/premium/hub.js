import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// WealthyAI - Központi Adatbázis Kapcsolat
const SUPABASE_URL = "https://csfaqnsuhhnposhyfxmk.supabase.co";
const SUPABASE_KEY = "sb_publishable_wjDPUzwhkqApZWEHWrvalQ_bSJr8iT0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function PremiumHub() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState({ 
    stripe: "CONNECTING...", 
    sendgrid: "CHECKING...",
    ph_status: "WARMING UP" 
  });

  const _K = "TUFTVEVSLURPTUlOQU5DRS0yMDI2"; // MASTER-DOMINANCE-2026
  
  const links = {
    cf: "aHR0cHM6Ly9kYXNoLmNsb3VkZmxhcmUuY29tL2QwMzAzZDdjNTAzOTRiMjgwYTI4YjU4ZDNjMTNmMTEvaG9tZS9kb21haW5z",
    ph: "aHR0cHM6Ly93d3cucHJvZHVjdGh1bnQuY29tL0B6b2x0YW5faG9ydmF0aDU=",
    zo: "aHR0cHM6Ly9tYWlsLnpvaG8uZXU=",
    li: "aHR0cHM6Ly93d3cubGlua2VkaW4uY29tL2luL3pvbHRhbi1ob3J2YXRoLTc3Mzg2YTMhOS8/bG9jYWxlPWh1",
    ve: "aHR0cHM6Ly92ZXJjZWwuY29tL2RvbmF0aW9uLXdlYnNpdGUtcHJvamVjdHMvd2VhbHRoeWFpLXdlYi9hbmFseXRpY3M=",
    st: "aHR0cHM6Ly9kYXNoYm9hcmQuc3RyaXBlLmNvbQ==",
    az: "aHR0cHM6Ly9wb3J0YWwuYXp1cmUuY29tLyNob21l",
    re: "aHR0cHM6Ly93d3cucmVkZGl0LmNvbS91c2VyL1B1enpsZWhlYWRlZC1TZXQ5MTg4Lw==",
    sb: "aHR0cHM6Ly9zdXBhYmFzZS5jb20vZGFzaGJvYXJkL29yZy91dWhvanduamJlYnVrimJmYnV3em4=" // SUPABASE ADMIN
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setComments(data);
  };

  const deleteComment = async (id) => {
    if (!window.confirm("Biztosan törlöd ezt a bejegyzést?")) return;
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (!error) fetchComments();
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    fetchComments();
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("wai_vip_token");
      const role = localStorage.getItem("wai_role");
      const isTokenValid = token === atob(_K);
      const masterStatus = isTokenValid && role !== "GUEST";
      setIsMaster(masterStatus);

      if (masterStatus) {
        fetch('/api/master-stats', {
          headers: { 'x-master-token': atob(_K) }
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

  const navigateTo = (path) => { window.location.href = path; };
  const openSecure = (key) => { window.open(atob(links[key]), "_blank", "noreferrer"); };

  const styles = {
    container: { minHeight: "100vh", width: "100%", backgroundColor: "#020617", color: "white", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: isMobile ? "0 10px 40px 10px" : "0 20px 40px 20px", textAlign: "center", backgroundImage: "radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)", boxSizing: "border-box" },
    adminBar: { width: "100%", backgroundColor: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #f59e0b50", padding: isMobile ? "20px 15px" : "12px 20px", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, marginBottom: isMobile ? "20px" : "40px", gap: isMobile ? "20px" : "15px" },
    statusGroup: { display: "flex", gap: isMobile ? "15px" : "25px", fontSize: "10px", fontFamily: "monospace", justifyContent: "center" },
    adminBtnGroup: { display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" },
    adminBtn: { padding: "8px 12px", borderRadius: "6px", fontSize: "9px", fontWeight: "bold", color: "white", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textTransform: "uppercase" },
    masterBadge: { background: "linear-gradient(90deg, #fbbf24, #f59e0b)", color: "#000", padding: "5px 15px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", letterSpacing: "2px", marginBottom: "20px", marginTop: isMobile ? "40px" : "20px", boxShadow: "0 0 20px rgba(251, 191, 36, 0.3)" },
    title: { fontSize: isMobile ? "1.8rem" : "2.8rem", marginBottom: "10px", fontWeight: "800" },
    grid: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "20px", width: "100%", maxWidth: "1100px", marginTop: "30px" },
    card: { background: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "24px", padding: isMobile ? "25px 15px" : "40px 30px", cursor: "pointer", transition: "all 0.3s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
    commentSection: { width: "100%", maxWidth: "850px", marginTop: "60px", padding: "30px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(56,189,248,0.2)", textAlign: "left" },
    commentCard: { display: "flex", gap: "15px", padding: "15px", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative" }
  };

  return (
    <div style={styles.container}>
      {isMaster && (
        <div style={styles.adminBar}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e", boxShadow: "0 0 10px #22c55e" }}></div>
            <span style={{ fontSize: "10px", fontWeight: "bold", color: "#f59e0b", letterSpacing: "1px" }}>WAI MASTER SYSTEM</span>
          </div>
          <div style={styles.statusGroup}>
            <div><div style={{ color: "#64748b" }}>STRIPE</div><div style={{ color: "#22c55e" }}>{stats.stripe}</div></div>
            <div><div style={{ color: "#64748b" }}>TRAFFIC</div><div style={{ color: "#3b82f6" }}>LIVE</div></div>
          </div>
          <div style={styles.adminBtnGroup}>
            <button onClick={() => openSecure('sb')} style={{ ...styles.adminBtn, backgroundColor: "#3ecf8e", color: "#000" }}>SUPABASE DATABASE</button>
            <button onClick={() => openSecure('cf')} style={{ ...styles.adminBtn, backgroundColor: "#f38020" }}>CLOUDFLARE</button>
            <button onClick={() => openSecure('ve')} style={{ ...styles.adminBtn, backgroundColor: "#000000" }}>VERCEL</button>
            <button onClick={() => openSecure('st')} style={{ ...styles.adminBtn, backgroundColor: "#4338ca" }}>STRIPE</button>
            <button onClick={() => openSecure('az')} style={{ ...styles.adminBtn, backgroundColor: "#2563eb" }}>AZURE</button>
          </div>
        </div>
      )}

      <div style={styles.masterBadge}>UNIVERSE MASTER ACCESS</div>
      <h1 style={styles.title}>WealthyAI Control Hub</h1>
      
      <div style={styles.grid}>
        <div style={styles.card} onClick={() => navigateTo("/day")}><div style={{ fontSize: "40px" }}>⚡</div><h2 style={{ margin: 0 }}>Daily</h2></div>
        <div style={styles.card} onClick={() => navigateTo("/premium-week")}><div style={{ fontSize: "40px" }}>📊</div><h2 style={{ margin: 0 }}>Weekly</h2></div>
        <div style={styles.card} onClick={() => navigateTo("/premium-month")}><div style={{ fontSize: "40px" }}>🧠</div><h2 style={{ margin: 0 }}>Monthly</h2></div>
      </div>

      <div style={styles.commentSection}>
        <h3 style={{ color: "#38bdf8", marginBottom: "20px", display: "flex", justifyContent: "space-between" }}>
          GLOBAL FEED MODERATION
          <span style={{ fontSize: "10px", color: "#64748b" }}>{comments.length} ACTIVE MESSAGES</span>
        </h3>
        {comments.map((c) => (
          <div key={c.id} style={styles.commentCard}>
            <img src={c.avatar} alt="A" style={{ width: "32px", height: "32px", borderRadius: "8px" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: c.role === "ADMIN" ? "#a78bfa" : "#38bdf8" }}>
                {c.user_name} <span style={{ opacity: 0.4, fontWeight: "normal", marginLeft: "10px" }}>{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{ fontSize: "13px", marginTop: "4px", opacity: 0.9 }}>{c.text}</div>
            </div>
            <button 
              onClick={() => deleteComment(c.id)} 
              style={{ background: "none", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "4px", padding: "2px 8px", fontSize: "9px", cursor: "pointer", height: "fit-content" }}
            >
              [ DELETE ]
            </button>
          </div>
        ))}
      </div>

      <button onClick={() => navigateTo("/")} style={{ marginTop: "60px", background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "12px 24px", borderRadius: "12px", cursor: "pointer", fontSize: "13px", opacity: 0.6 }}>
        ← Back to Base Dashboard
      </button>
    </div>
  );
}
