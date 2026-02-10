import React, { useRef, useEffect, useState } from "react";

export default function Topography({ stressFactor, income, spawnNumbers, isAiOpen }) {
  const canvasRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  
  const stateRef = useRef({
    time: 0,
    floatingNumbers: [],
    animationFrameId: null
  });

  // Stratégiai szótár a briefing jelleg erősítéséhez
  const STRATEGIC_WORDS = {
    stable: ["STABILITY", "RESERVE", "LIQUIDITY", "GROWTH", "BALANCE", "ASSET", "FLOW"],
    warning: ["FRAGILITY", "VOLATILITY", "EXPOSURE", "ADAPTATION", "HEATING", "FRICTION"],
    critical: ["CRISIS", "EROSION", "RISK", "LIMIT", "URGENCY", "STRESS", "THRESHOLD"]
  };

  useEffect(() => {
    if (isAiOpen || !isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const parent = canvas.parentNode;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    window.addEventListener("resize", resize);
    resize();

    const project = (x, y, z) => {
      const perspective = 600;
      const scale = perspective / (perspective + y); 
      return {
        x: x * scale,
        y: (y * 0.5 - z) * scale
      };
    };

    const draw = () => {
      const state = stateRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // A mozgás sebessége a stressz függvényében
      state.time += 0.01 + (stressFactor * 0.07);

      const gridSize = 22; 
      const cols = 18;
      const rows = 18;
      const heightScale = 10 + (stressFactor * 55);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2.2);

      // 3D Háló rajzolása
      for (let i = 0; i < 2; i++) {
        for (let a = 0; a < (i === 0 ? rows : cols); a++) {
          ctx.beginPath();
          for (let b = 0; b < (i === 0 ? cols : rows); b++) {
            const x = i === 0 ? (b - cols / 2) * gridSize : (a - cols / 2) * gridSize;
            const y = i === 0 ? (a - rows / 2) * gridSize : (b - rows / 2) * gridSize;
            
            const dist = Math.sqrt(x*x + y*y) * 0.2;
            const h = Math.sin(dist - state.time) * heightScale;
            
            const p = project(x, y, h);
            
            // Színváltás: kékből lilásba, ahogy nő a stressz
            const alpha = Math.max(0.1, (h + heightScale) / (heightScale * 2));
            const hue = 194 - (stressFactor * 40); 
            ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha * 0.35})`;

            if (b === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.stroke();
        }
      }
      ctx.restore();

      // SZAVAK spawnolása a számok helyett
      if (spawnNumbers && Math.random() < 0.035) {
        // Szókészlet kiválasztása a stressz alapján
        let pool = STRATEGIC_WORDS.stable;
        if (stressFactor > 0.4) pool = STRATEGIC_WORDS.warning;
        if (stressFactor > 0.8) pool = STRATEGIC_WORDS.critical;
        
        const word = pool[Math.floor(Math.random() * pool.length)];

        state.floatingNumbers.push({
          x: (Math.random() * 0.7 + 0.15) * canvas.width,
          y: canvas.height / 1.7,
          text: word,
          opacity: 1,
          speed: 0.4 + Math.random() * 0.4, // Lassabb, "lebegősebb" emelkedés
          fontSize: 8 + Math.random() * 4
        });
      }

      // Szavak kirajzolása és animálása
      for (let i = state.floatingNumbers.length - 1; i >= 0; i--) {
        const n = state.floatingNumbers[i];
        n.y -= n.speed;
        n.opacity -= 0.007; // Lassabb elhalványulás az olvashatóságért

        ctx.font = `bold ${n.fontSize}px 'Courier New', monospace`;
        ctx.letterSpacing = "1px";
        
        // Szín: kék (nyugodt) vagy lila/pirosas (stressz)
        const textColor = stressFactor > 0.5 ? `167, 139, 250` : `56, 189, 248`;
        ctx.fillStyle = `rgba(${textColor}, ${n.opacity})`;
        
        // Egy kis "glitch" effekt, ha nagy a stressz
        const drift = stressFactor > 0.8 ? (Math.random() - 0.5) * 3 : 0;
        ctx.fillText(n.text, n.x + drift, n.y);

        if (n.opacity <= 0) state.floatingNumbers.splice(i, 1);
      }

      state.animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(stateRef.current.animationFrameId);
    };
  }, [stressFactor, income, spawnNumbers, isAiOpen, isVisible]);

  if (!isVisible || isAiOpen) return null;

  return (
    <div style={{ 
      width: "100%", 
      height: "220px", 
      position: "relative", 
      marginBottom: "15px",
      overflow: "hidden",
      borderRadius: "12px",
      background: "rgba(2, 6, 23, 0.4)" 
    }}>
      <button 
        onClick={() => setIsVisible(false)}
        style={{
          position: "absolute", top: "5px", right: "10px", background: "none",
          border: "none", color: "#64748b", cursor: "pointer", zIndex: 10, fontSize: "18px",
          opacity: 0.6
        }}
      >
        ×
      </button>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", background: "transparent" }} />
    </div>
  );
}
