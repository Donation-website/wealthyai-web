import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://csfaqnsuhhnposhyfxmk.supabase.co";
const SUPABASE_KEY = "sb_publishable_wjDPUzwhkqApZWEHWrvalQ_bSJr8iT0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function PremiumHub() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState([]); // ÚJ: cikkek tárolása
  const [aiStatus, setAiStatus] = useState("checking");
  const [stripeBalance, setStripeBalance] = useState("FETCHING...");
  const [todayTraffic, setTodayTraffic] = useState(0); 
  const [realHumans, setRealHumans] = useState(0); 
  
  const [newPost, setNewPost] = useState({ title: "", content: "", image_url: "" });
  const [editingId, setEditingId] = useState(null); // ÚJ: szerkesztés állapota
  const [uploading, setUploading] = useState(false);

  const _K = "TUFTVEVSLURPTUlOQU5DRS0yMDI2"; 
  
  const links = {
    cf: { name: "CLOUDFLARE", color: "#f38020", url: "aHR0cHM6Ly9kYXNoDashY2xvdWRmbGFyZS5jb20vZDAzMDNkN2M1MDM5NGIyODBhMjhiNThkM2MxM2YxMWYvaG9tZS9vdmVydmlldw==" },
    lc: { name: "LOCANTO", color: "#32cd32", url: "aHR0cHM6Ly93d3cubG9jYW50by5jb20vZy9teS8/c2hvdz1teS1hZHM=" },
    ph: { name: "PH PROFIL", color: "#da552f", url: "aHR0cHM6Ly93d3cucHJvZHVjdGh1bnQuY29tL0B6b2x0YW5faG9ydmF0aDU=" },
    zo: { name: "ZOHO MAIL", color: "#1e3a8a", url: "aHR0cHM6Ly9tYWlsLnpvaG8uZXU=" },
    nc: { name: "NC EMAIL", color: "#de3723", url: "aHR0cHM6Ly9hcC53d3cubmFtZWNoZWFwLmNvbS9Qcm9kdWN0TGlzdC9FbWFpbFN1YnNjcmlwdGlvbnM=" },
    li: { name: "LINKEDIN", color: "#0a66c2", url: "aHR0cHM6Ly93d3cubGlua2VkaW4uY29tL2luL3pvbHRhbi1ob3J2YXRoLTc3Mzg2YTMhOS8/bG9jYWxlPWh1" },
    re: { name: "REDDIT", color: "#ff4500", url: "aHR0cHM6Ly93d3cucmVkZGl0LmNvbS91c2VyL1B1enpsZWhlYWRlZC1TZXQ5MTg4Lw==" },
    ve: { name: "VERCEL", color: "#000000", url: "aHR0cHM6Ly92ZXJjZWwuY29tL2RvbmF0aW9uLXdlYnNpdGUtcHJvamVjdHMvd2VhbHRoeWFpLXdlYi9hbmFseXRpY3M=" },
    st: { name: "STRIPE", color: "#4338ca", url: "aHR0cHM6Ly9kYXNoYm9hcmQuc3RyaXBlLmNvbQ==" },
    az: { name: "AZURE", color: "#2563eb", url: "aHR0cHM6Ly9wb3J0YWwuYXp1cmUuY29tLyNob21l" },
    sb: { name: "SUPABASE", color: "#3ecf8e", url: "aHR0cHM6Ly9zdXBhYmFzZS5jb20vZGFzaGJvYXJkL29yZy91dWhvanduamJlYnVrimJmYnV3em4=" },
    fb: { name: "FB GROUP", color: "#1877F2", url: "aHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL2dyb3Vwcy9mZWVk" },
    ne: { name: "NETLIFY", color: "#00AD9F", url: "aHR0cHM6Ly9hcHAubmV0bGlmeS5jb20vdGVhbXMvZG9uYXRpb24td2Vic2l0ZS9wcm9qZWN0cw==" }
  };

  const fetchMasterStats = async () => {
    try {
      const res = await fetch('/api/master-stats', {
        headers: { 'x-master-token': 'MASTER-DOMINANCE-2026' }
      });
      const data = await res.json();
      if (data.stripe) setStripeBalance(data.stripe);
      if (data.trafficToday !== undefined) setTodayTraffic(data.trafficToday);
      if (data.humansToday !== undefined) setRealHumans(data.humansToday); 
    } catch (e) {
      setStripeBalance("OFFLINE");
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
    if (!error && data) setComments(data);
  };

  // ÚJ: Cikkek lekérése
  const fetchPosts = async () => {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error && data) setPosts(data);
  };

  const checkAiHealth = async () => {
    try {
      const res = await fetch('/api/ai-health-check');
      const data = await res.json();
      setAiStatus(data.status);
    } catch (e) {
      setAiStatus("OFFLINE");
    }
  };

  const deleteComment = async (id) => {
    if (!window.confirm("Biztosan törlöd?")) return;
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (!error) fetchComments();
  };

  // ÚJ: Cikk törlése
  const deletePost = async (id) => {
    if (!window.confirm("Biztosan törlöd ezt az insight-ot?")) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) fetchPosts();
  };

  // ÚJ: Cikk betöltése szerkesztésre
  const startEdit = (post) => {
    setEditingId(post.id);
    setNewPost({ title: post.title, content: post.content, image_url: post.image_url });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    let { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath);
    setNewPost({ ...newPost, image_url: data.publicUrl });
    setUploading(false);
    alert("Image uploaded and linked!");
  };

  const publishArticle = async () => {
    if (!newPost.title || !newPost.content) return alert("Title and Content are required!");
    
    if (editingId) {
      // UPDATE meglévő cikk
      const { error } = await supabase.from('posts').update({ 
        title: newPost.title, 
        content: newPost.content, 
        image_url: newPost.image_url 
      }).eq('id', editingId);

      if (error) {
        alert("Update Error: " + error.message);
      } else {
        alert("INSIGHT UPDATED SUCCESSFULLY!");
        setEditingId(null);
        setNewPost({ title: "", content: "", image_url: "" });
        fetchPosts();
      }
    } else {
      // INSERT új cikk
      const { error } = await supabase.from('posts').insert([
        { 
          title: newPost.title, 
          content: newPost.content, 
          image_url: newPost.image_url, 
          created_at: new Date() 
        }
      ]);
      if (error) {
        alert("Error: " + error.message);
      } else {
        alert("INSIGHT PUBLISHED SUCCESSFULLY!");
        setNewPost({ title: "", content: "", image_url: "" });
        fetchPosts();
      }
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    fetchComments();
    fetchPosts();
    checkAiHealth();
    
    const healthInterval = setInterval(checkAiHealth, 60000);
    const statsInterval = setInterval(fetchMasterStats, 300000); 

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("wai_vip_token");
      if (token === atob(_K)) {
        setIsMaster(true);
        fetchMasterStats();
      }
    }
    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(healthInterval);
      clearInterval(statsInterval);
    };
  }, []);

  const navigateTo = (path) => { window.location.href = path; };
  const openSecure = (key) => { window.open(atob(links[key].url), "_blank", "noreferrer"); };

  const styles = {
    container: { minHeight: "100vh", width: "100%", backgroundColor: "#020617", color: "white", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 0 40px 0", backgroundImage: "radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)", boxSizing: "border-box" },
    adminBar: { width: "100%", backgroundColor: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #f59e0b50", padding: "10px 20px", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, marginBottom: "40px", gap: "10px" },
    btnGroup: { display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "center" },
    adminBtn: { padding: "6px 10px", borderRadius: "4px", fontSize: "8px", fontWeight: "bold", color: "white", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textTransform: "uppercase" },
    grid: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "20px", width: "90%", maxWidth: "1100px" },
    card: { background: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "24px", padding: "30px 15px", cursor: "pointer", textAlign: "center", transition: "transform 0.2s" },
    commentSection: { width: "90%", maxWidth: "850px", marginTop: "40px", padding: "25px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(56,189,248,0.2)" },
    statusDot: { width: "8px", height: "8px", borderRadius: "50%", background: aiStatus === "HEALTHY" ? "#22c55e" : "#ef4444", boxShadow: aiStatus === "HEALTHY" ? "0 0 10px #22c55e" : "0 0 15px #ef4444", animation: aiStatus !== "HEALTHY" ? "blink 1s infinite" : "none" },
    balanceBadge: { background: "rgba(67, 56, 202, 0.2)", border: "1px solid #4338ca", padding: "4px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
    trafficBadge: { background: "rgba(56, 189, 248, 0.15)", border: "1px solid #38bdf8", padding: "4px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "8px" },
    input: { width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "14px", boxSizing: "border-box" }
  };

  return (
    <div style={styles.container}>
      <style>{` @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } } `}</style>

      {isMaster && (
        <div style={styles.adminBar}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "10px", fontWeight: "900", color: "#f59e0b" }}>MASTER HUB</span>
            
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.3)", padding: "4px 10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={styles.statusDot}></div>
                <span style={{ fontSize: "9px", fontWeight: "bold", color: aiStatus === "HEALTHY" ? "#22c55e" : "#ef4444" }}>CORE: {aiStatus}</span>
            </div>

            <div style={styles.balanceBadge} onClick={fetchMasterStats} title="Refresh stats">
                <span style={{ fontSize: "9px", color: "#a5b4fc", fontWeight: "bold" }}>STRIPE:</span>
                <span style={{ fontSize: "11px", color: "#fff", fontWeight: "900", fontFamily: "monospace" }}>{stripeBalance}</span>
            </div>

            <div style={styles.trafficBadge}>
                <span style={{ fontSize: "9px", color: "#38bdf8", fontWeight: "bold" }}>VISITS:</span>
                <span style={{ fontSize: "11px", color: "#fff", fontWeight: "900", fontFamily: "monospace" }}>{todayTraffic}</span>
                <span style={{ fontSize: "9px", color: "#22c55e", fontWeight: "bold", marginLeft: "8px" }}>👤:</span>
                <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: "900", fontFamily: "monospace" }}>{realHumans}</span>
            </div>
          </div>

          <div style={styles.btnGroup}>
            {Object.keys(links).map(key => (
              <button key={key} onClick={() => openSecure(key)} style={{ ...styles.adminBtn, backgroundColor: links[key].color, color: (key === 'sb' || key === 'nc' || key === 'lc' || key === 'ne') ? '#000' : 'white' }}>{links[key].name}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: "linear-gradient(90deg, #fbbf24, #f59e0b)", color: "#000", padding: "5px 15px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", marginBottom: "20px", marginTop: "20px" }}>UNIVERSE MASTER ACCESS</div>
      <h1 style={{ fontSize: isMobile ? "2rem" : "3rem", fontWeight: "900", marginBottom: "30px" }}>Control Hub</h1>
      
      {isMaster && (
        <div style={{ ...styles.commentSection, borderColor: "#f59e0b", marginBottom: "40px" }}>
          <h3 style={{ color: "#f59e0b", marginTop: 0, marginBottom: "20px" }}>{editingId ? "✍️ EDITING INSIGHT" : "🚀 PUBLISH NEW INSIGHT"}</h3>
          
          <input 
            style={styles.input} 
            placeholder="Article Title..." 
            value={newPost.title} 
            onChange={(e) => setNewPost({...newPost, title: e.target.value})} 
          />

          <div style={{ marginBottom: "10px" }}>
            <label style={{ fontSize: "11px", color: "#f59e0b", display: "block", marginBottom: "5px" }}>COVER IMAGE (LOCAL UPLOAD):</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              style={{ ...styles.input, padding: "8px" }}
            />
            {uploading && <span style={{ fontSize: "10px", color: "#38bdf8" }}>Uploading image...</span>}
            {newPost.image_url && <div style={{ fontSize: "10px", color: "#22c55e" }}>✓ Image linked: {newPost.image_url.substring(0, 40)}...</div>}
          </div>

          <textarea 
            style={{ ...styles.input, minHeight: "150px", fontFamily: "inherit" }} 
            placeholder="Paste your LinkedIn content here..." 
            value={newPost.content} 
            onChange={(e) => setNewPost({...newPost, content: e.target.value})} 
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={publishArticle} 
              disabled={uploading}
              style={{ flex: 2, padding: "15px", background: uploading ? "#334155" : "#f59e0b", color: "black", border: "none", borderRadius: "12px", fontWeight: "900", cursor: uploading ? "not-allowed" : "pointer", fontSize: "14px" }}
            >
              {uploading ? "WAITING..." : editingId ? "UPDATE INSIGHT" : "CONFIRM & PUBLISH INSIGHT"}
            </button>
            {editingId && (
              <button 
                onClick={() => { setEditingId(null); setNewPost({ title: "", content: "", image_url: "" }); }}
                style={{ flex: 1, padding: "15px", background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" }}
              >
                CANCEL
              </button>
            )}
          </div>
        </div>
      )}

      {/* ÚJ: Insight-ok kezelése szakasz */}
      {isMaster && posts.length > 0 && (
        <div style={{ ...styles.commentSection, borderColor: "#38bdf8", marginBottom: "40px" }}>
          <h3 style={{ color: "#38bdf8", marginTop: 0, marginBottom: "20px" }}>📑 MANAGE INSIGHTS</h3>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {posts.map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: "13px", fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>{p.title}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => startEdit(p)} style={{ background: "none", border: "1px solid #38bdf8", color: "#38bdf8", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", cursor: "pointer" }}>EDIT</button>
                  <button onClick={() => deletePost(p.id)} style={{ background: "none", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", cursor: "pointer" }}>DEL</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.grid}>
        <div style={styles.card} onClick={() => navigateTo("/insights")}>📖 <h2>Insights</h2></div>
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
        <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "15px" }}>
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
