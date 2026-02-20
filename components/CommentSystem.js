import React, { useState, useEffect } from "react";

const CommentSystem = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("wai_blog_comments");
    if (saved) {
      setComments(JSON.parse(saved));
    } else {
      const initial = [
        {
          id: 1,
          user: "WealthyAI System",
          text: "Genesis thread initialized. Please share your financial interpretations below.",
          date: "2026.02.20",
          role: "SYSTEM",
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin&backgroundColor=020617"
        }
      ];
      setComments(initial);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !userName.trim()) return;

    const isMaster = userName.toLowerCase().includes("bill") || userName.toLowerCase().includes("wealthyai");

    const commentObj = {
      id: Date.now(),
      user: userName,
      text: newComment,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      role: isMaster ? "MASTER" : "USER",
      avatar: isMaster 
        ? `https://api.dicebear.com/7.x/bottts/svg?seed=${userName}&backgroundColor=38bdf8`
        : `https://api.dicebear.com/7.x/identicon/svg?seed=${userName}`
    };

    const updated = [commentObj, ...comments];
    setComments(updated);
    localStorage.setItem("wai_blog_comments", JSON.stringify(updated));
    setNewComment("");
  };

  const styles = {
    section: {
      marginTop: "40px",
      padding: "30px",
      background: "rgba(15, 23, 42, 0.4)",
      borderRadius: "24px",
      border: "1px solid rgba(56, 189, 248, 0.2)",
      backdropFilter: "blur(12px)",
      textAlign: "left",
      color: "#fff"
    },
    input: {
      width: "100%",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(56, 189, 248, 0.3)",
      borderRadius: "12px",
      padding: "12px 15px",
      color: "white",
      fontSize: "14px",
      marginBottom: "10px",
      outline: "none",
      boxSizing: "border-box"
    },
    button: {
      background: "linear-gradient(90deg, #0ea5e9, #6366f1)",
      color: "white",
      border: "none",
      padding: "12px 24px",
      borderRadius: "12px",
      fontWeight: "bold",
      cursor: "pointer",
      textTransform: "uppercase",
      width: "100%"
    },
    commentCard: {
      display: "flex",
      gap: "15px",
      marginTop: "20px",
      padding: "15px",
      borderRadius: "16px",
      background: "rgba(255,255,255,0.03)",
      borderLeft: "4px solid #38bdf8"
    },
    masterCard: {
      borderLeft: "4px solid #f59e0b",
      background: "rgba(245, 158, 11, 0.08)"
    },
    avatar: { width: "40px", height: "40px", borderRadius: "8px", background: "#0f172a" }
  };

  return (
    <div style={styles.section}>
      <h3 style={{ marginBottom: "20px", color: "#38bdf8" }}>Global Discussion</h3>
      <form onSubmit={handleSubmit}>
        <input style={styles.input} placeholder="Your Name" value={userName} onChange={(e) => setUserName(e.target.value)} required />
        <textarea style={{ ...styles.input, minHeight: "80px" }} placeholder="Insight..." value={newComment} onChange={(e) => setNewComment(e.target.value)} required />
        <button type="submit" style={styles.button}>Post Insight</button>
      </form>
      <div>
        {comments.map((c) => (
          <div key={c.id} style={{ ...styles.commentCard, ...(c.role === "MASTER" ? styles.masterCard : {}) }}>
            <img src={c.avatar} alt="v" style={styles.avatar} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: c.role === "MASTER" ? "#f59e0b" : "#38bdf8" }}>
                {c.user} <span style={{ fontWeight: "400", opacity: 0.5, marginLeft: "10px" }}>{c.date}</span>
              </div>
              <div style={{ fontSize: "14px", marginTop: "5px", lineHeight: "1.5" }}>{c.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSystem;
