import React, { useRef, useEffect } from "react";

export default function Topography({ stressFactor, income, spawnNumbers }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let time = 0;
    const floatingNumbers = [];

    const resize = () => {
      const parent = canvas.parentNode;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    window.addEventListener("resize", resize);
    resize();

    // Izometrikus vetítés
    const project = (x, y, z) => {
      return {
        x: x - y,
        y: (x + y) * 0.5 - z
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.02 + stressFactor * 0.08;

      const gridSize = 28;
      const cols = Math.floor(canvas.width / gridSize);
      const rows = Math.floor(canvas.height / gridSize);
      const heightScale = 20 + stressFactor * 60;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 3);

      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.lineWidth = 1;

      // Rács rajzolása
      for (let y = 0; y < rows; y++) {
        ctx.beginPath();
        for (let x = 0; x < cols; x++) {
          const h =
            Math.sin(x * 0.35 + time) *
            Math.cos(y * 0.35 - time * 0.7) *
            heightScale;

          const p = project(x * gridSize, y * gridSize, h);
          if (x === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      for (let x = 0; x < cols; x++) {
        ctx.beginPath();
        for (let y = 0; y < rows; y++) {
          const h =
            Math.sin(x * 0.35 + time) *
            Math.cos(y * 0.35 - time * 0.7) *
            heightScale;

          const p = project(x * gridSize, y * gridSize, h);
          if (y === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      ctx.restore();

      // Számok spawnolása
      if (spawnNumbers && Math.random() < 0.08) {
        floatingNumbers.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * 200,
          y: canvas.height / 2,
          val: Math.floor((income / 20) * (Math.random() + 0.5)),
          opacity: 1,
          speed: 0.6 + Math.random()
        });
      }

      // Lebegő számok
      for (let i = floatingNumbers.length - 1; i >= 0; i--) {
        const n = floatingNumbers[i];
        n.y -= n.speed;
        n.opacity -= 0.01;

        ctx.font = "bold 12px 'Courier New', monospace";
        ctx.fillStyle = `rgba(16, 185, 129, ${n.opacity})`;
        ctx.fillText(`+${n.val}`, n.x, n.y);

        if (n.opacity <= 0) floatingNumbers.splice(i, 1);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [stressFactor, income, spawnNumbers]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        background: "transparent"
      }}
    />
  );
}
