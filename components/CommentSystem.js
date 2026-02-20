import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// WealthyAI - Központi Adatbázis Kapcsolat
const SUPABASE_URL = "https://csfaqnsuhhnposhyfxmk.supabase.co";
const SUPABASE_KEY = "sb_publishable_wjDPUzwhkqApZWEHWrvalQ_bSJr8iT0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CommentSystem = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");
  const [isAdminSession, setIsAdminSession] = useState(false);

  const ADMIN_SECRET = "111"; 
  const CORE_AVATAR = "/wealthyai/icons/avatar.png";

  // Kommentek betöltése a Supabase felhőből
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setComments(data);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const deleteComment = async (id) => {
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (!error) fetchComments();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let text = newComment.trim();
    let name = userName.trim();
    if (!text || !name) return;

    const isAdmin = text.includes(ADMIN_SECRET);
    if (isAdmin) {
      text = text.replace(ADMIN_SECRET, "").trim();
      setIsAdminSession(true);
    }

    const { error } = await supabase.from('comments').insert([{
      user_name: name,
      text: text,
      role: isAdmin ? "ADMIN" : "USER",
      avatar: isAdmin 
        ? CORE_AVATAR 
        : `https://api.dicebear.com/7.x/shapes/svg?seed=${name}&backgroundColor=020617`
    }]);

    if (!error) {
      setNewComment("");
      fetchComments();
    }
  };

  const styles = {
    section: { marginTop: "40px", padding: "30px", background: "rgba(15, 23, 42, 0.5)", borderRadius: "24px", border: "1px solid rgba(56, 189, 248, 0.2)", backdropFilter: "blur(12px)", color: "#fff" },
    input: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "12px", padding: "12px 15px", color: "white", marginBottom: "10px", outline: "none", boxSizing: "border-box" },
    button: { background: "linear-gradient(90deg, #38bdf8, #a78bfa)", color: "white", border: "none", padding: "14px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", width: "100%", textTransform: "uppercase" },
    card: { display: "flex", gap: "15px", marginTop: "20px", padding: "18px", borderRadius: "20px", background: "rgba(255,255,255,0.02)", borderLeft: "4px solid #38bdf8", position: "relative" },
    adminCard: { borderLeft: "4px solid #a78bfa", background: "rgba(167, 139, 250, 0.05)" },
    avatar: { width: "48px", height: "48px", borderRadius: "12px", background: "#020617", objectFit: "cover" },
    delBtn: { position: "absolute", top: "15px", right: "15px", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "10px" }
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
              alt="Avatar" 
              style={styles.avatar} 
              onError={(e) => { e.target.onerror = null; e.target.src="/wealthyai/icons/avatar.png"; }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: c.role === "ADMIN" ? "#a78bfa" : "#38bdf8" }}>
                {c.user_name} 
                {c.role === "ADMIN" && <span style={{ fontSize: "9px", background: "#a78bfa", color: "#000", padding: "1px 5px", borderRadius: "4px", marginLeft: "8px" }}>CORE</span>}
                <span style={{ fontWeight: "400", opacity: 0.4, fontSize: "11px", marginLeft: "10px" }}>
                   {new Date(c.created_at).toLocaleString('hu-HU')}
                </span>
              </div>
              <div style={{ fontSize: "15px", marginTop: "6px", color: "rgba(255,255,255,0.85)" }}>{c.text}</div>
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
