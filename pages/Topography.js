import React, { useRef, useEffect } from "react";

export default function Topography({ stressFactor, income, spawnNumbers }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.ref.current; // Hibajavítás: canvasRef.current
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    
    let animationFrameId;
    let offset = 0;
    
    // Számok tárolása a lebegéshez
    const floatingNumbers = [];

    const resize = () => {
      const rect = canvasRef.current.parentNode.getBoundingClientRect();
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
    };

    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Dinamikus sebesség: alapsebesség + stressz szorzó
      const speed = 0.02 + (stressFactor * 0.15);
      offset += speed;

      // Számok generálása, ha a szimuláció aktív
      if (spawnNumbers && Math.random() < 0.05) {
        floatingNumbers.push({
          x: Math.random() * canvasRef.current.width,
          y: canvasRef.current.height,
          val: Math.floor((income / 10) * (Math.random() + 0.5)),
          opacity: 1,
          speed: 1 + Math.random() * 2
        });
      }

      // Hullámok rajzolása (Topográfiai rétegek)
      const layers = 5;
      for (let l = 0; l < layers; l++) {
        ctx.beginPath();
        const layerOpacity = (l + 1) / layers;
        // Stressz hatására a színek vörösesbe hajolhatnak (opcionális)
        ctx.strokeStyle = `rgba(56, 189, 248, ${layerOpacity * 0.4})`;
        ctx.lineWidth = 1;

        for (let x = 0; x < canvasRef.current.width; x += 2) {
          // A hullám amplitúdója a stressz faktorral nő
          const amplitude = (20 + (l * 10)) * (1 + stressFactor * 2);
          const frequency = 0.005 + (l * 0.001);
          
          const y = (canvasRef.current.height / 2) + 
                    Math.sin(x * frequency + offset + l) * amplitude +
                    Math.cos(x * 0.01 - offset * 0.5) * (amplitude / 2);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Lebegő számok frissítése és rajzolása
      for (let i = floatingNumbers.length - 1; i >= 0; i--) {
        const n = floatingNumbers[i];
        n.y -= n.speed;
        n.opacity -= 0.005;

        ctx.font = "10px monospace";
        ctx.fillStyle = `rgba(16, 185, 129, ${n.opacity})`;
        ctx.fillText(`+${n.val}`, n.x, n.y);

        if (n.opacity <= 0) {
          floatingNumbers.splice(i, 1);
        }
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
        display: "block",
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle at center, #0f172a 0%, #020617 100%)",
      }}
    />
  );
}
