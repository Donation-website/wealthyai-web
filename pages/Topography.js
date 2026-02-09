import React, { useRef, useEffect, useState } from "react";

export default function Topography({ stressFactor, income, spawnNumbers, isAiOpen }) {
  const canvasRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  
  // Refs az animáció folytonosságához (nem nullázódnak újrarenderelésnél)
  const stateRef = useRef({
    time: 0,
    floatingNumbers: [],
    animationFrameId: null
  });

  useEffect(() => {
    // Ha az AI ablak nyitva van vagy a felhasználó bezárta az X-szel, ne rajzoljunk
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
      return {
        x: x - y,
        y: (x + y) * 0.5 - z
      };
    };

    const draw = () => {
      const state = stateRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // A stressFactor befolyásolja a sebességet
      state.time += 0.015 + (stressFactor * 0.07);

      const gridSize = 30;
      const cols = Math.floor(canvas.width / gridSize) + 4;
      const rows = Math.floor(canvas.height / gridSize) + 4;
      const heightScale = 15 + (stressFactor * 65);

      ctx.save();
      // Középre igazítás
      ctx.translate(canvas.width / 2, canvas.height / 4);

      // --- RÁCS RAJZOLÁSA ---
      ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
      ctx.lineWidth = 1;

      // Vízszintes vonalak
      for (let y = 0; y < rows; y++) {
        ctx.beginPath();
        for (let x = 0; x < cols; x++) {
          const h = Math.sin(x * 0.3 + state.time) * Math.cos(y * 0.3 - state.time * 0.5) * heightScale;
          const p = project((x - cols/2) * gridSize, (y - rows/2) * gridSize, h);
          if (x === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Függőleges vonalak
      for (let x = 0; x < cols; x++) {
        ctx.beginPath();
        for (let y = 0; y < rows; y++) {
          const h = Math.sin(x * 0.3 + state.time) * Math.cos(y * 0.3 - state.time * 0.5) * heightScale;
          const p = project((x - cols/2) * gridSize, (y - rows/2) * gridSize, h);
          if (y === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      ctx.restore();

      // --- FLOATING NUMBERS LOGIKA ---
      if (spawnNumbers && Math.random() < 0.06) {
        state.floatingNumbers.push({
          x: Math.random() * canvas.width,
          y: canvas.height - 50,
          val: Math.floor((income / 10) * (Math.random() + 0.2)),
          opacity: 1,
          speed: 0.5 + Math.random() * 1.5
        });
      }

      for (let i = state.floatingNumbers.length - 1; i >= 0; i--) {
        const n = state.floatingNumbers[i];
        n.y -= n.speed;
        n.opacity -= 0.008;

        ctx.font = "bold 13px 'Courier New', monospace";
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
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Bezáró gomb */}
      <button 
        onClick={() => setIsVisible(false)}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(255,255,255,0.1)",
          border: "none",
          color: "white",
          borderRadius: "50%",
          width: "24px",
          height: "24px",
          cursor: "pointer",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px"
        }}
      >
        ×
      </button>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          background: "transparent"
        }}
      />
    </div>
  );
}
