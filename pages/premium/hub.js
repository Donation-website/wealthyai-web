import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://csfaqnsuhhnposhyfxmk.supabase.co";
const SUPABASE_KEY = "sb_publishable_wjDPUzwhkqApZWEHWrvalQ_bSJr8iT0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function PremiumHub() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [comments, setComments] = useState([]);

  const _K = "TUFTVEVSLURPTUlOQU5DRS0yMDI2"; 
  
  const links = {
    cf: { name: "CLOUDFLARE", color: "#f38020", url: "aHR0cHM6Ly9kYXNoLmNsb3VkZmxhcmUuY29tL2QwMzAzZDdjNTAzOTRiMjgwYTI4YjU4ZDNjMTNmMTEvaG9tZS9kb21haW5z" },
    ph: { name: "PH PROFIL", color: "#da552f", url: "aHR0cHM6Ly93d3cucHJvZHVjdGh1bnQuY29tL0B6b2x0YW5faG9ydmF0aDU=" },
    zo: { name: "ZOHO MAIL", color: "#1e3a8a", url: "aHR0cHM6Ly9tYWlsLnpvaG8uZXU=" },
    li: { name: "LINKEDIN", color: "#0a66c2", url: "aHR0cHM6Ly93d3cubGlua2VkaW4uY29tL2luL3pvbHRhbi1ob3J2YXRoLTc3Mzg2YTMhOS8/bG9jYWxlPWh1" },
    fb: { name: "FB REBOOT", color: "#1877F2", url: "aHR0cHM6Ly9kZXZlbG9wZXJzLmZhY2Vib29rLmNvbS90b29scy9kZWJ1Zy8=" }, // ÚJ FB DEBUGGER GOMB
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
    container: { minHeight: "100vh", width: "100%", backgroundColor: "#020617", color: "white", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 0 40px 0", backgroundImage: "radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)", boxSizing: "border-box" },
    adminBar: { width: "100%", backgroundColor: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #f59e0b50", padding: "15px 30px", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, marginBottom: "40px", gap: "10px" },
    btnGroup: { display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" },
    adminBtn: { padding: "8px 12px", borderRadius: "6px", fontSize: "9px", fontWeight: "bold", color: "white", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textTransform: "uppercase" },
    grid: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "20px", width: "90%", maxWidth: "1100px" },
    card: { background: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "24px", padding: "30px 15px", cursor: "pointer", textAlign: "center" },
    commentSection: { width: "90%", maxWidth: "850px", marginTop: "40px", padding: "25px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(56,189,248,0.2)" },
    scrollArea: { maxHeight: "400px", overflowY: "auto", marginTop: "15px" }
  };

  return (
    <div style={styles.container}>
      {isMaster && (
        <div style={styles.adminBar}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "10px", fontWeight: "900", color: "#f59e0b" }}>MASTER HUB</span></div>
          <div style={styles.btnGroup}>
            {Object.keys(links).map(key => (
              <button key={key} onClick={() => openSecure(key)} style={{ ...styles.adminBtn, backgroundColor: links[key].color, color: key === 'sb' ? '#000' : 'white' }}>{links[key].name}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: "linear-gradient(90deg, #fbbf24, #f59e0b)", color: "#000", padding: "5px 15px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", marginBottom: "20px", marginTop: "20px" }}>UNIVERSE MASTER ACCESS</div>
      <h1 style={{ fontSize: isMobile ? "2rem" : "3rem", fontWeight: "900", marginBottom: "30px" }}>Control Hub</h1>
      
      <div style={styles.grid}>
        <div style={styles.card} onClick={() => navigateTo("/day")}>⚡ <h2>Daily</h2></div>
        <div style={styles.card} onClick={() => navigateTo("/premium-week")}>📊 <h2>Weekly</h2></div>
        <div style={styles.card} onClick={() => navigateTo("/premium-month")}>🧠 <h2>Monthly</h2></div>
      </div>

      <div style={styles.commentSection}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(56,189,248,0.2)", paddingBottom: "15px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>🔔</span>
            {comments.length > 0 && <div style={{ width: "8px", height: "8px", background: "#ef4444", borderRadius: "50%" }}></div>}
            <h3 style={{ color: "#38bdf8", margin: 0 }}>LIVE FEED</h3>
          </div>
          <span style={{ fontSize: "10px", color: "#64748b" }}>{comments.length} MESSAGES</span>
        </div>
        <div style={styles.scrollArea}>
          {comments.map((c) => (
            <div key={c.id} style={{ display: "flex", gap: "12px", padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <img src={c.avatar} alt="A" style={{ width: "30px", height: "30px", borderRadius: "6px" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: c.role === "ADMIN" ? "#a78bfa" : "#38bdf8" }}>{c.user_name}</div>
                <div style={{ fontSize: "13px", opacity: 0.9 }}>{c.text}</div>
              </div>
              <button onClick={() => deleteComment(c.id)} style={{ background: "none", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "4px", padding: "2px 6px", fontSize: "8px", cursor: "pointer" }}>DEL</button>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => navigateTo("/")} style={{ marginTop: "40px", background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "10px 20px", borderRadius: "8px", opacity: 0.5 }}>← EXIT</button>
    </div>
  );
}
