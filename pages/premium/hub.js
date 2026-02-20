import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://csfaqnsuhhnposhyfxmk.supabase.co";
const SUPABASE_KEY = "sb_publishable_wjDPUzwhkqApZWEHWrvalQ_bSJr8iT0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function PremiumHub() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState({ stripe: "ACTIVE", ph_status: "ENGAGED" });

  const _K = "TUFTVEVSLURPTUlOQU5DRS0yMDI2"; 
  
  const links = {
    cf: { name: "CLOUDFLARE", color: "#f38020", url: "aHR0cHM6Ly9kYXNoLmNsb3VkZmxhcmUuY29tL2QwMzAzZDdjNTAzOTRiMjgwYTI4YjU4ZDNjMTNmMTEvaG9tZS9kb21haW5z" },
    ph: { name: "PH PROFIL", color: "#da552f", url: "aHR0cHM6Ly93d3cucHJvZHVjdGh1bnQuY29tL0B6b2x0YW5faG9ydmF0aDU=" },
    zo: { name: "ZOHO MAIL", color: "#1e3a8a", url: "aHR0cHM6Ly9tYWlsLnpvaG8uZXU=" },
    li: { name: "LINKEDIN", color: "#0a66c2", url: "aHR0cHM6Ly93d3cubGlua2VkaW4uY29tL2luL3pvbHRhbi1ob3J2YXRoLTc3Mzg2YTMhOS8/bG9jYWxlPWh1" },
    re: { name: "REDDIT", color: "#ff4500", url: "aHR0cHM6Ly93d3cucmVkZGl0LmNvbS91c2VyL1B1enpsZWhlYWRlZC1TZXQ5MTg4Lw==" },
    ve: { name: "VERCEL", color: "#000000", url: "aHR0cHM6Ly92ZXJjZWwuY29tL2RvbmF0aW9uLXdlYnNpdGUtcHJvamVjdHMvd2VhbHRoeWFpLXdlYi9hbmFseXRpY3M=" },
    st: { name: "STRIPE", color: "#4338ca", url: "aHR0cHM6Ly9kYXNoYm9hcmQuc3RyaXBlLmNvbQ==" },
    az: { name: "AZURE", color: "#2563eb", url: "aHR0cHM6Ly9wb3J0YWwuYXp1cmUuY29tLyNob21l" },
    sb: { name: "SUPABASE", color: "#3ecf8e", url: "aHR0cHM6Ly9zdXBhYmFzZS5jb20vZGFzaGJvYXJkL29yZy91dWhvanduamJlYnVrimJmYnV3em4=" }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
    if (!error && data) setComments(data);
  };

  const deleteComment = async (id) => {
    if (!window.confirm("Biztosan törlöd?")) return;
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
      setIsMaster(token === atob(_K));
    }
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigateTo = (path) => { window.location.href = path; };
  const openSecure = (key) => { window.open(atob(links[key].url), "_blank", "noreferrer"); };

  const styles = {
    container: { minHeight: "100vh", width: "100%", backgroundColor: "#020617", color: "white", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 0 40px 0", backgroundImage: "radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)", boxSizing: "border-box", overflowX: "hidden" },
    adminBar: { width: "100%", backgroundColor: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #f59e0b50", padding: isMobile ? "20px" : "15px 30px", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, marginBottom: "40px", gap: "15px" },
    btnGroup: { display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" },
    adminBtn: { padding: "10px 14px", borderRadius: "8px", fontSize: "10px", fontWeight: "bold", color: "white", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textTransform: "uppercase", transition: "0.3s" },
    masterBadge: { background: "linear-gradient(90deg, #fbbf24, #f59e0b)", color: "#000", padding: "6px 20px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", letterSpacing: "1px", marginBottom: "20px", boxShadow: "0 0 20px rgba(251, 191, 36, 0.3)" },
    grid: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "25px", width: "90%", maxWidth: "1100px" },
    card: { background: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "28px", padding: "40px 20px", cursor: "pointer", transition: "0.3s" },
    commentSection: { width: "90%", maxWidth: "850px", marginTop: "50px", padding: "30px", borderRadius: "28px", background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(56,189,248,0.2)", textAlign: "left" },
    scrollArea: { maxHeight: "450px", overflowY: "auto", marginTop: "20px", paddingRight: "10px" },
    notif: { position: "relative", display: "flex", alignItems: "center", gap: "10px" },
    dot: { width: "10px", height: "10px", background: "#ef4444", borderRadius: "50%", boxShadow: "0 0 10px #ef4444" }
  };

  return (
    <div style={styles.container}>
      {isMaster && (
        <div style={styles.adminBar}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#22c55e", boxShadow: "0 0 10px #22c55e" }}></div>
            <span style={{ fontSize: "11px", fontWeight: "900", color: "#f59e0b", letterSpacing: "2px" }}>MASTER CONTROL</span>
          </div>
          <div style={styles.btnGroup}>
            {Object.keys(links).map(key => (
              <button key={key} onClick={() => openSecure(key)} 
                style={{ ...styles.adminBtn, backgroundColor: links[key].color, color: key === 'sb' ? '#000' : 'white' }}>
                {links[key].name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={styles.masterBadge}>UNIVERSE MASTER ACCESS</div>
      <h1 style={{ fontSize: isMobile ? "2rem" : "3.5rem", fontWeight: "900", marginBottom: "40px" }}>Control Hub</h1>
      
      <div style={styles.grid}>
        <div style={styles.card} onClick={() => navigateTo("/day")}><div style={{ fontSize: "50px", marginBottom: "15px" }}>⚡</div><h2 style={{ margin: 0 }}>Daily</h2><p style={{ opacity: 0.6 }}>Instant Data</p></div>
        <div style={styles.card} onClick={() => navigateTo("/premium-week")}><div style={{ fontSize: "50px", marginBottom: "15px" }}>📊</div><h2 style={{ margin: 0 }}>Weekly</h2><p style={{ opacity: 0.6 }}>Analytics</p></div>
        <div style={styles.card} onClick={() => navigateTo("/premium-month")}><div style={{ fontSize: "50px", marginBottom: "15px" }}>🧠</div><h2 style={{ margin: 0 }}>Monthly</h2><p style={{ opacity: 0.6 }}>Strategy</p></div>
      </div>

      <div style={styles.commentSection}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(56,189,248,0.3)", paddingBottom: "20px" }}>
          <div style={styles.notif}>
            <span style={{ fontSize: "24px" }}>🔔</span>
            {comments.length > 0 && <div style={styles.dot}></div>}
            <h3 style={{ color: "#38bdf8", margin: 0, fontSize: "1.2rem", fontWeight: "800" }}>GLOBAL FEED</h3>
          </div>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>{comments.length} MESSAGES</span>
        </div>

        <div style={styles.scrollArea}>
          {comments.length === 0 ? (
            <p style={{ textAlign: "center", opacity: 0.4, padding: "40px" }}>Waiting for signals...</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} style={{ display: "flex", gap: "15px", padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "flex-start" }}>
                <img src={c.avatar} alt="A" style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#020617", border: "1px solid rgba(56,189,248,0.2)" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: "bold", color: c.role === "ADMIN" ? "#a78bfa" : "#38bdf8" }}>
                    {c.user_name} <span style={{ opacity: 0.4, fontWeight: "normal", marginLeft: "10px", fontSize: "10px" }}>{new Date(c.created_at).toLocaleString('hu-HU')}</span>
                  </div>
                  <div style={{ fontSize: "14px", marginTop: "6px", opacity: 0.9, lineHeight: "1.5" }}>{c.text}</div>
                </div>
                <button onClick={() => deleteComment(c.id)} style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "6px", padding: "6px 10px", fontSize: "9px", cursor: "pointer", fontWeight: "bold" }}>DELETE</button>
              </div>
            ))
          )}
        </div>
      </div>

      <button onClick={() => navigateTo("/")} style={{ marginTop: "60px", background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "14px 28px", borderRadius: "12px", cursor: "pointer", fontSize: "14px", opacity: 0.5, fontWeight: "bold" }}>
        ← EXIT TO BASE
      </button>
    </div>
  );
}
