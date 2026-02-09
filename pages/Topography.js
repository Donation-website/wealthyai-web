import React, { useRef, useEffect } from "react";

export default function Topography({ stressFactor, income, spawnNumbers }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current; // Itt volt a hiba: .ref felesleges
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    let animationFrameId;
    let offset = 0;
    
    // Számok tárolása a lebegéshez
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

    const draw = () => {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dinamikus sebesség: alapsebesség + stressz szorzó
      const speed = 0.02 + (stressFactor * 0.15);
      offset += speed;

      // Számok generálása, ha a szimuláció aktív
      if (spawnNumbers && Math.random() < 0.1) { // Kicsit sűrűbb generálás
        floatingNumbers.push({
          x: Math.random() * canvas.width,
          y: canvas.height - 20,
          val: Math.floor((income / 20) * (Math.random() + 0.5)),
          opacity: 1,
          speed: 0.5 + Math.random() * 1.5
        });
      }

      // Hullámok rajzolása (Topográfiai rétegek)
      const layers = 5;
      for (let l = 0; l < layers; l++) {
        ctx.beginPath();
        const layerOpacity = (l + 1) / layers;
        // Stressz hatására a színek az égszínkéktől a ciánig tolódnak
        ctx.strokeStyle = `rgba(56, 189, 248, ${layerOpacity * 0.4})`;
        ctx.lineWidth = 1.5;

        for (let x = 0; x < canvas.width; x += 3) {
          // A hullám amplitúdója a stressz faktorral nő
          const amplitude = (15 + (l * 12)) * (1 + stressFactor * 2.5);
          const frequency = 0.004 + (l * 0.001);
          
          const y = (canvas.height / 2) + 
                    Math.sin(x * frequency + offset + l) * amplitude +
                    Math.cos(x * 0.008 - offset * 0.4) * (amplitude / 1.5);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Lebegő számok frissítése és rajzolása
      for (let i = floatingNumbers.length - 1; i >= 0; i--) {
        const n = floatingNumbers[i];
        n.y -= n.speed;
        n.opacity -= 0.006;

        ctx.font = "bold 11px 'Courier New', monospace";
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
        background: "transparent"
      }}
    />
  );
}
