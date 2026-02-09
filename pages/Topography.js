import React, { useRef, useEffect, useState } from "react";

export default function Topography({ stressFactor, income, spawnNumbers, isAiOpen }) {
  const canvasRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  
  const stateRef = useRef({
    time: 0,
    floatingNumbers: [],
    animationFrameId: null
  });

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

    // Erősebb 3D perspektíva (mátrix szerűbb hatás)
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
      
      state.time += 0.01 + (stressFactor * 0.06);

      const gridSize = 22; // Kisebb rács a finomabb részletekért
      const cols = 18;
      const rows = 18;
      const heightScale = 10 + (stressFactor * 50);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2.2);

      ctx.lineWidth = 1;

      // 3D Háló rajzolása (Vízszintes és függőleges szálak)
      for (let i = 0; i < 2; i++) {
        for (let a = 0; a < (i === 0 ? rows : cols); a++) {
          ctx.beginPath();
          for (let b = 0; b < (i === 0 ? cols : rows); b++) {
            const x = i === 0 ? (b - cols / 2) * gridSize : (a - cols / 2) * gridSize;
            const y = i === 0 ? (a - rows / 2) * gridSize : (b - rows / 2) * gridSize;
            
            const dist = Math.sqrt(x*x + y*y) * 0.2;
            const h = Math.sin(dist - state.time) * heightScale;
            
            const p = project(x, y, h);
            
            // Színátmenet a magasság alapján (hasonlóan a képhez)
            const alpha = Math.max(0.1, (h + heightScale) / (heightScale * 2));
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.4})`;

            if (b === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.stroke();
        }
      }
      ctx.restore();

      // Számok spawnolása a háló "hullámaiból"
      if (spawnNumbers && Math.random() < 0.05) {
        state.floatingNumbers.push({
          x: (Math.random() * 0.6 + 0.2) * canvas.width,
          y: canvas.height / 1.8,
          val: Math.floor((income / 15) * (Math.random() + 0.5)),
          opacity: 1,
          speed: 0.8 + Math.random()
        });
      }

      for (let i = state.floatingNumbers.length - 1; i >= 0; i--) {
        const n = state.floatingNumbers[i];
        n.y -= n.speed;
        n.opacity -= 0.012;

        ctx.font = "bold 11px 'Courier New', monospace";
        ctx.fillStyle = `rgba(16, 185, 129, ${n.opacity})`;
        ctx.fillText(`+$${n.val}`, n.x, n.y);

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
    <div style={{ width: "100%", height: "220px", position: "relative", marginBottom: "15px" }}>
      <button 
        onClick={() => setIsVisible(false)}
        style={{
          position: "absolute", top: "0px", right: "0px", background: "none",
          border: "none", color: "#64748b", cursor: "pointer", zIndex: 10, fontSize: "18px"
        }}
      >
        ×
      </button>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", background: "transparent" }} />
    </div>
  );
}
