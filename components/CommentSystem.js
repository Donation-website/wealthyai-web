import React, { useState, useEffect } from "react";

const CommentSystem = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");

  const ADMIN_SECRET = "#WAI2026";

  useEffect(() => {
    const saved = localStorage.getItem("wai_blog_comments");
    if (saved) {
      setComments(JSON.parse(saved));
    } else {
      setComments([{
        id: 1,
        user: "WealthyAI System",
        text: "Genesis thread initialized. Connection stable.",
        date: "2026.02.20",
        role: "ADMIN",
        avatar: "/wealthyai/icons/avatar.png"
      }]);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    let text = newComment.trim();
    let name = userName.trim();
    if (!text || !name) return;

    const isAdmin = text.includes(ADMIN_SECRET);
    if (isAdmin) text = text.replace(ADMIN_SECRET, "").trim();

    const commentObj = {
      id: Date.now(),
      user: name,
      text: text,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      role: isAdmin ? "ADMIN" : "USER",
      // ADMIN: A te saját avatarod | VENDÉG: Komoly, absztrakt sötét minta
      avatar: isAdmin 
        ? "/wealthyai/icons/avatar.png"
        : `https://api.dicebear.com/7.x/shapes/svg?seed=${name}&backgroundColor=0f172a&shapeColor=38bdf8`
    };

    const updated = [commentObj, ...comments];
    setComments(updated);
    localStorage.setItem("wai_blog_comments", JSON.stringify(updated));
    setNewComment("");
  };

  const styles = {
    section: { marginTop: "40px", padding: "30px", background: "rgba(15, 23, 42, 0.4)", borderRadius: "24px", border: "1px solid rgba(56, 189, 248, 0.2)", backdropFilter: "blur(12px)", color: "#fff" },
    input: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "12px", padding: "12px 15px", color: "white", marginBottom: "10px", outline: "none", boxSizing: "border-box" },
    button: { background: "linear-gradient(90deg, #38bdf8, #a78bfa)", color: "white", border: "none", padding: "12px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", width: "100%", textTransform: "uppercase" },
    card: { display: "flex", gap: "15px", marginTop: "20px", padding: "18px", borderRadius: "20px", background: "rgba(255,255,255,0.02)", borderLeft: "4px solid #38bdf8" },
    adminCard: { borderLeft: "4px solid #a78bfa", background: "rgba(167, 139, 250, 0.05)" },
    avatar: { width: "48px", height: "48px", borderRadius: "10px", background: "#020617", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }
  };

  return (
    <div style={styles.section}>
      <h3 style={{ marginBottom: "20px", color: "#38bdf8", fontSize: "1rem", letterSpacing: "1px" }}>GLOBAL DISCUSSION</h3>
      <form onSubmit={handleSubmit}>
        <input style={styles.input} placeholder="Nickname" value={userName} onChange={(e) => setUserName(e.target.value)} required />
        <textarea style={{ ...styles.input, minHeight: "80px" }} placeholder="Insight..." value={newComment} onChange={(e) => setNewComment(e.target.value)} required />
        <button type="submit" style={styles.button}>Post Insight</button>
      </form>
      <div style={{ marginTop: "30px" }}>
        {comments.map((c) => (
          <div key={c.id} style={{ ...styles.card, ...(c.role === "ADMIN" ? styles.adminCard : {}) }}>
            <img src={c.avatar} alt="P" style={styles.avatar} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: c.role === "ADMIN" ? "#a78bfa" : "#38bdf8" }}>
                {c.user} {c.role === "ADMIN" && <span style={{ fontSize: "10px", background: "#a78bfa", color: "#000", padding: "1px 6px", borderRadius: "4px", marginLeft: "8px" }}>CORE</span>}
                <span style={{ fontWeight: "400", opacity: 0.4, fontSize: "12px", marginLeft: "10px" }}>{c.date}</span>
              </div>
              <div style={{ fontSize: "15px", marginTop: "6px", lineHeight: "1.6", color: "rgba(255,255,255,0.9)" }}>{c.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSystem;
