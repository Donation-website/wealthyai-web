import React, { useState, useEffect } from "react";

const CommentSystem = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");
  const [isAdminSession, setIsAdminSession] = useState(false);

  // Kért módosítások: kód 111 és a pontos elérési út
  const ADMIN_SECRET = "111"; 
  const CORE_AVATAR = "/wealthyai/icons/avatar.png";

  useEffect(() => {
    const saved = localStorage.getItem("wai_blog_comments");
    if (saved) {
      setComments(JSON.parse(saved));
    } else {
      // Itt a kezdő üzenet: NINCS ROBOT, csak a CORE_AVATAR hivatkozás
      setComments([{
        id: 1,
        user: "WealthyAI System",
        text: "Genesis thread initialized. Connection stable.",
        date: "2026.02.20 12:00",
        role: "ADMIN",
        avatar: CORE_AVATAR
      }]);
    }
  }, []);

  const deleteComment = (id) => {
    const updated = comments.filter(c => c.id !== id);
    setComments(updated);
    localStorage.setItem("wai_blog_comments", JSON.stringify(updated));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let text = newComment.trim();
    let name = userName.trim();
    if (!text || !name) return;

    const isAdmin = text.includes(ADMIN_SECRET);
    if (isAdmin) {
      text = text.replace(ADMIN_SECRET, "").trim();
      setIsAdminSession(true);
    }

    const commentObj = {
      id: Date.now(),
      user: name,
      text: text,
      date: new Date().toLocaleString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      role: isAdmin ? "ADMIN" : "USER",
      // Ha Admin, akkor a te képed, ha vendég, akkor egy stílusos sötét absztrakt forma
      avatar: isAdmin 
        ? CORE_AVATAR 
        : `https://api.dicebear.com/7.x/shapes/svg?seed=${name}&backgroundColor=020617&shape1Color=38bdf8&shape2Color=a78bfa&shape3Color=1e293b`
    };

    const updated = [commentObj, ...comments];
    setComments(updated);
    localStorage.setItem("wai_blog_comments", JSON.stringify(updated));
    setNewComment("");
  };

  const styles = {
    section: { marginTop: "40px", padding: "30px", background: "rgba(15, 23, 42, 0.5)", borderRadius: "24px", border: "1px solid rgba(56, 189, 248, 0.2)", backdropFilter: "blur(12px)", color: "#fff" },
    input: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "12px", padding: "12px 15px", color: "white", marginBottom: "10px", outline: "none", boxSizing: "border-box" },
    button: { background: "linear-gradient(90deg, #38bdf8, #a78bfa)", color: "white", border: "none", padding: "14px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", width: "100%", textTransform: "uppercase" },
    card: { display: "flex", gap: "15px", marginTop: "20px", padding: "18px", borderRadius: "20px", background: "rgba(255,255,255,0.02)", borderLeft: "4px solid #38bdf8", position: "relative", alignItems: "flex-start" },
    adminCard: { borderLeft: "4px solid #a78bfa", background: "rgba(167, 139, 250, 0.05)" },
    avatar: { width: "48px", height: "48px", borderRadius: "12px", background: "#020617", objectFit: "cover", flexShrink: 0 },
    delBtn: { position: "absolute", top: "15px", right: "15px", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "10px", opacity: 0.6 }
  };

  return (
    <div style={styles.section}>
      <h3 style={{ marginBottom: "20px", color: "#38bdf8", fontSize: "0.9rem", letterSpacing: "2px" }}>GLOBAL DISCUSSION</h3>
      <form onSubmit={handleSubmit}>
        <input style={styles.input} placeholder="Nickname" value={userName} onChange={(e) => setUserName(e.target.value)} required />
        <textarea style={{ ...styles.input, minHeight: "80px" }} placeholder="Insight..." value={newComment} onChange={(e) => setNewComment(e.target.value)} required />
        <button type="submit" style={styles.button}>Post Insight</button>
      </form>
      <div style={{ marginTop: "30px" }}>
        {comments.map((c) => (
          <div key={c.id} style={{ ...styles.card, ...(c.role === "ADMIN" ? styles.adminCard : {}) }}>
            <img 
              src={c.avatar} 
              alt="WAI" 
              style={styles.avatar} 
              // Ha nem találja a képedet, akkor sem dob be robotot, csak egy sötét hátteret
              onError={(e) => { e.target.onerror = null; e.target.src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: c.role === "ADMIN" ? "#a78bfa" : "#38bdf8", display: "flex", alignItems: "center" }}>
                {c.user} 
                {c.role === "ADMIN" && <span style={{ fontSize: "9px", background: "#a78bfa", color: "#000", padding: "1px 5px", borderRadius: "4px", marginLeft: "8px" }}>CORE</span>}
                <span style={{ fontWeight: "400", opacity: 0.4, fontSize: "11px", marginLeft: "10px" }}>{c.date}</span>
              </div>
              <div style={{ fontSize: "15px", marginTop: "6px", lineHeight: "1.6", color: "rgba(255,255,255,0.85)", wordBreak: "break-word" }}>{c.text}</div>
            </div>
            {isAdminSession && (
              <button onClick={() => deleteComment(c.id)} style={styles.delBtn}>[ DELETE ]</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSystem;
