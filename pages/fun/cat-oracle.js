import React, { useState, useEffect } from "react";

export default function CatOracle() {
  const [image, setImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [catName, setCatName] = useState("");
  const [habit, setHabit] = useState("");
  const [prophecy, setProphecy] = useState("");
  const [paid, setPaid] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const startScan = () => {
    if (!catName || !habit) return alert("Please fill in the cat's details!");
    setScanning(true);
    // 4 másodperces "színház"
    setTimeout(() => {
      setScanning(false);
      // Itt dobná fel a Stripe fizetést. Tesztként most rögtön hívjuk a Llamát.
      fetchProphecy();
    }, 4000);
  };

  const fetchProphecy = async () => {
    // Itt hívod a te Llama proxy-dat
    const res = await fetch('/api/llama-proxy', {
      method: 'POST',
      body: JSON.stringify({
        prompt: `Cat Name: ${catName}, Habit: ${habit}. Write a 4-sentence ancient soul reading. Be mystic and funny.`,
        mode: 'cat-oracle'
      })
    });
    const data = await res.json();
    setProphecy(data.text);
    setPaid(true);
  };

  return (
    <div style={{ backgroundColor: "#0f172a", color: "#e2e8f0", minHeight: "100vh", padding: "20px", fontFamily: "'Cinzel', serif", textAlign: "center" }}>
      <h1>THE CAT ORACLE</h1>
      <p>Discover your feline's ancient past...</p>

      {!image ? (
        <div style={{ border: "2px dashed #38bdf8", padding: "40px", borderRadius: "20px" }}>
          <input type="file" onChange={handleImage} />
          <p>Upload a photo to begin the soul-sync</p>
        </div>
      ) : (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img src={image} style={{ maxWidth: "300px", borderRadius: "15px", filter: scanning ? "grayscale(100%)" : "none" }} />
          {scanning && (
            <div style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "2px",
              backgroundColor: "#38bdf8", boxShadow: "0 0 15px #38bdf8",
              animation: "scan 2s infinite linear"
            }} />
          )}
        </div>
      )}

      {!paid && (
        <div style={{ marginTop: "20px" }}>
          <input placeholder="Cat's Name" onChange={e => setCatName(e.target.value)} style={styles.input} />
          <textarea placeholder="Describe one weird habit..." onChange={e => setHabit(e.target.value)} style={styles.input} />
          <button onClick={startScan} style={styles.button}>REVEAL ANCIENT SOUL</button>
        </div>
      )}

      {prophecy && (
        <div style={styles.resultBox}>
          <h2 style={{ color: "#fbbf24" }}>{catName.toUpperCase()}'S DESTINY</h2>
          <p style={{ fontStyle: "italic", lineHeight: "1.6" }}>{prophecy}</p>
          <button onClick={() => window.print()} style={{ marginTop: "15px", fontSize: "10px", opacity: 0.6 }}>Download Certificate</button>
        </div>
      )}

      <style>{`
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
      `}</style>
    </div>
  );
}

const styles = {
  input: { display: "block", width: "100%", maxWidth: "300px", margin: "10px auto", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "white" },
  button: { backgroundColor: "#38bdf8", color: "#0f172a", padding: "15px 30px", borderRadius: "30px", fontWeight: "bold", border: "none", cursor: "pointer", marginTop: "10px" },
  resultBox: { marginTop: "30px", padding: "20px", border: "1px solid #fbbf24", borderRadius: "15px", background: "rgba(251, 191, 36, 0.05)", maxWidth: "500px", margin: "30px auto" }
};
