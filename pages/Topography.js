import React, { useRef, useEffect } from 'react';

export default function Topography({ stressFactor }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      const dpr = window.devicePixelRatio || 2;
      canvas.width = container.offsetWidth * dpr;
      canvas.height = container.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      if (!container) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.7;
      
      const time = Date.now() * 0.001;
      const offset = time * (0.2 + (stressFactor * 0.5));

      // Dinamikus sor-számítás: nem nyúlik, hanem szaporodik a rács
      const spacingX = 25;
      const spacingY = 18;
      const dynamicRows = Math.ceil(container.offsetHeight / spacingY) + 4; 
      const cols = 22;

      for (let y = 0; y < dynamicRows; y++) {
        for (let x = 0; x < cols; x++) {
          const project = (ix, iy) => {
            // Hullámzás: a stressz növeli az amplitúdót
            const freq = 0.3;
            const wave = Math.sin(ix * freq + iy * freq + offset) * (5 + (stressFactor * 45));
            
            // Fix perspektíva fentről indítva
            const px = (ix - cols / 2) * spacingX * (1 + iy * 0.025);
            const py = (iy * spacingY) + wave + 40; 
            
            return { x: px + container.offsetWidth / 2, y: py };
          };

          const p1 = project(x, y);
          const p2 = project(x + 1, y);
          const p3 = project(x, y + 1);

          if (x < cols - 1) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
          if (y < dynamicRows - 1) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p3.x, p3.y);
          }
        }
      }
      ctx.globalAlpha = 0.2 + (stressFactor * 0.4);
      ctx.stroke();
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [stressFactor]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
