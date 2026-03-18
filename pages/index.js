import React, { useState, useEffect, useRef } from "react";
import SEO from "../components/SEO";
import Head from "next/head";
import TrafficTracker from "../components/TrafficTracker";

/* ===== SPIDERNET ANIMATION COMPONENT ===== */
function SpiderNet() {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResizeCheck = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResizeCheck();
    window.addEventListener("resize", handleResizeCheck);
    return () => window.removeEventListener("resize", handleResizeCheck);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let particles = [];
    const particleCount = 180; 
    const connectionDistance = 140; 
    const mouse = { x: null, y: null, radius: 150 };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    window.addEventListener("resize", resize);
    resize();

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    class Particle {
      constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.size = Math.random() * 1.2 + 0.3;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
      }

      draw() {
        ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
        if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;

        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= (dx / distance) * force * 2;
            this.y -= (dy / distance) * force * 2;
          }
        }
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const connect = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < connectionDistance) {
            let opacity = 1 - (distance / connectionDistance);
            ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach(p => { p.update(); p.draw(); });
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile]);

  if (isMobile) return null;
  return (
    <canvas 
      ref={canvasRef} 
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', background: 'transparent' }} 
    />
  );
}

const PremiumVideo = React.memo(function PremiumVideo({ 
  size = "160px", videoRef, isVideoMuted, isVideoPlaying, toggleVideoPlayback, toggleVideoMute 
}) {
  const PlayIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="black"><path d="M8 5V19L19 12L8 5Z" /></svg>);
  const PauseIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="black"><path d="M6 19H10V5H6V19ZM14 5V19H18V5H14V5Z" /></svg>);
  const MuteIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="black"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM3 9v6h4l5 5V4L7 9H3z" /></svg>);
  const UnmuteIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="black"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v1.79l2.48 2.48c.01-.08.02-.16.02-.24zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>);

  return (
    <div style={{ 
      width: size, height: `calc(${size} * 1.18)`, background: "rgba(0,0,0,0.8)", borderRadius: "24px", 
      border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", overflow: "hidden", position: "relative"
    }}>
        <video ref={videoRef} src="/wealthyai/icons/Time.mp4" autoPlay loop muted={isVideoMuted} playsInline style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        <div style={{ position: "absolute", bottom: "10px", left: "0", width: "100%", display: "flex", justifyContent: "center", gap: "8px" }}>
            <div onClick={toggleVideoPlayback} style={{ background: "white", borderRadius: "50%", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              {isVideoPlaying ? <PauseIcon /> : <PlayIcon />}
            </div>
            <div onClick={toggleVideoMute} style={{ background: "white", borderRadius: "50%", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              {isVideoMuted ? <UnmuteIcon /> : <MuteIcon />}
            </div>
        </div>
    </div>
  );
});

const AnalogClock = ({ city, timezone, speed = 1, isMobile }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => { setTime(prev => new Date(prev.getTime() + (1000 * speed))); }, 1000);
    return () => clearInterval(interval);
  }, [speed]);

  const getTimeInZone = () => {
    if (speed !== 1) return time;
    return new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
  };

  const displayTime = getTimeInZone();
  const sec = displayTime.getSeconds();
  const min = displayTime.getMinutes();
  const hour = displayTime.getHours();
  const clockSize = isMobile ? "22px" : "28px";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
      <div style={{
        width: clockSize, height: clockSize, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)",
        position: "relative", background: "rgba(0,0,0,0.3)"
      }}>
        <div style={{ position: "absolute", width: "1px", height: "30%", background: "white", left: "50%", bottom: "50%", transformOrigin: "bottom", transform: `translateX(-50%) rotate(${(hour % 12) * 30 + min * 0.5}deg)` }} />
        <div style={{ position: "absolute", width: "1px", height: "40%", background: "white", left: "50%", bottom: "50%", transformOrigin: "bottom", transform: `translateX(-50%) rotate(${min * 6}deg)` }} />
        <div style={{ position: "absolute", width: "0.5px", height: "45%", background: "#38bdf8", left: "50%", bottom: "50%", transformOrigin: "bottom", transform: `translateX(-50%) rotate(${sec * 6}deg)` }} />
      </div>
      <span style={{ fontSize: "6px", opacity: 0.5, textTransform: "uppercase", letterSpacing: "1px" }}>{city}</span>
    </div>
  );
};

export default function Home() {
  const SITE_URL = "https://mywealthyai.com";
  const SHARE_TEXT = "AI-powered financial clarity with WealthyAI";

  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [botValue, setBotValue] = useState("");
  const [isBotTrapped, setIsBotTrapped] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setIsVideoPlaying(true);
    const onPause = () => setIsVideoPlaying(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  useEffect(() => {
    const renderTurnstile = () => {
      if (window.turnstile && document.getElementById("turnstile-container")) {
        window.turnstile.render("#turnstile-container", {
          sitekey: "0x4AAAAAACfHxdcNLlIOQCJF",
          appearance: "always",
          callback: () => { setIsVerified(true); },
          theme: "dark",
        });
        return true;
      }
      return false;
    };
    const scriptInterval = setInterval(() => { if (renderTurnstile()) clearInterval(scriptInterval); }, 500);
    return () => clearInterval(scriptInterval);
  }, []);

  const handleAudioEnd = () => { setIsPlaying(false); setIsMuted(true); if (audioRef.current) audioRef.current.currentTime = 0; };
  const stopAudio = () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; setIsPlaying(false); } };
  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    if (audioRef.current) {
      if (audioRef.current.paused) {
        if (videoRef.current) { videoRef.current.muted = true; setIsVideoMuted(true); }
        audioRef.current.muted = false; audioRef.current.play(); setIsPlaying(true); setIsMuted(false);
      } else { audioRef.current.pause(); setIsPlaying(false); }
    }
  };
  const toggleVideoPlayback = (e) => { e.preventDefault(); e.stopPropagation(); const video = videoRef.current; if (!video) return; if (video.paused) { video.play().catch(err => {}); } else { video.pause(); } };
  const toggleVideoMute = (e) => { e.preventDefault(); e.stopPropagation(); if (videoRef.current) { const newMute = !isVideoMuted; if (!newMute) stopAudio(); videoRef.current.muted = newMute; setIsVideoMuted(newMute); } };
  const clearSelectionIfNeeded = (e) => { if (!["a", "button", "input"].includes(e.target.tagName.toLowerCase())) { const sel = window.getSelection(); if (sel) sel.removeAllRanges(); } };
  const handleStartClick = (e) => { if (botValue !== "") { e.preventDefault(); setIsBotTrapped(true); return; } if (!isVerified) { e.preventDefault(); return; } stopAudio(); };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WealthyAI",
    "url": "https://mywealthyai.com",
    "logo": "https://mywealthyai.com/wealthyai/icons/generated.png",
    "description": "We didn’t build WealthyAI to tell people what to do with their money. WealthyAI was built around a different question: What happens if AI doesn’t advise — but interprets?",
    "founder": {
      "@type": "Person",
      "name": "Zoltán Horváth",
      "jobTitle": "Founder & Owner",
      "url": "https://mywealthyai.com",
      "address": { "@type": "PostalAddress", "addressCountry": "United Kingdom" }
    }
  };

  return (
    <>
      <TrafficTracker />
      <Head>
        <title>WealthyAI – AI-powered financial clarity | Zoltán Horváth</title>
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      </Head>
      <SEO title="WealthyAI – AI-powered financial clarity" description="AI-powered financial thinking. Structured insights." url={SITE_URL} />

      <main onMouseDown={clearSelectionIfNeeded} className="main-container">
        <SpiderNet />
        <div className="animated-bg"></div>
        <audio ref={audioRef} src="/wealthyai/icons/nyitobeszed.mp3" preload="auto" onEnded={handleAudioEnd} />

        {/* HEADER AREA */}
        <div className="header-wrapper">
          <div className="top-nav">
             <a href="/insights" onClick={stopAudio} className="glass-link">Insights</a>
             <div className="clock-group">
                <AnalogClock city="New York" timezone="America/New_York" isMobile={isMobile} />
                <AnalogClock city="London" timezone="Europe/London" isMobile={isMobile} />
                <AnalogClock city="Paris" timezone="Europe/Paris" isMobile={isMobile} />
                <AnalogClock city="Tokyo" timezone="Asia/Tokyo" isMobile={isMobile} />
                <AnalogClock city="WealthyAI" timezone="UTC" speed={0.75} isMobile={isMobile} />
             </div>
          </div>

          <div className="secondary-nav">
            <a href="/PrivacyPolicy" onClick={stopAudio} className="glass-link">Privacy</a>
            <a href="/philosophy" onClick={stopAudio} className="glass-link">Philosophy</a>
            <a href="/how-it-works" onClick={stopAudio} className="glass-link">How it works</a>
            <a href="/blog" onClick={stopAudio} className="glass-link">Blog</a>
          </div>
        </div>

        {/* NARRATOR BOX */}
        <div onClick={toggleMute} className="narrator-glass">
          <div className="audio-visualizer">
            {[1, 2, 3].map(i => (
              <div key={i} className={`bar ${isPlaying && !isMuted ? 'active' : ''}`} style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <span className="narrator-text">{!isPlaying ? "Resume Narrator" : "Pause Narrator"}</span>
        </div>

        {/* CENTER CONTENT */}
        <div className="hero-section">
          <img src="/wealthyai/icons/generated.png" alt="WealthyAI logo" className="brand-logo" />
          <div className="hero-text-container">
            <h1 className="hero-title">
              AI-powered financial thinking.<br />
              Structured insights.
            </h1>
            <div className="hero-subline">
              <span>Not advice.</span>
              <span className="dot">•</span>
              <span>Not predictions.</span>
              <span className="dot">•</span>
              <span>Financial intelligence.</span>
            </div>
          </div>
        </div>

        {/* LEFT ACTION AREA */}
        <div className="action-area">
          <a href={isVerified && !isBotTrapped ? "/start" : "#"} onClick={handleStartClick} className="start-btn-modern">
            <span className="btn-label">Start</span>
            <span className="btn-subtext">START FOR FREE</span>
          </a>
          
          <div className="status-badge">
            <div className="status-dot"></div>
            <span>No Log-In System</span>
          </div>

          <p className="helper-text">
            {isBotTrapped ? "System congestion..." : "Start with a simple financial snapshot. Under a minute."}
          </p>
        </div>

        {/* VIDEO BOX (RIGHT) */}
        {!isMobile && (
          <div className="video-sidebar">
              <PremiumVideo 
                size="150px" videoRef={videoRef} isVideoMuted={isVideoMuted}
                isVideoPlaying={isVideoPlaying} toggleVideoPlayback={toggleVideoPlayback} toggleVideoMute={toggleVideoMute}
              />
              <span className="video-caption">Space reserved for excellence</span>
          </div>
        )}

        {/* FOOTER */}
        <footer className="footer-modern">
          <div className="footer-left">
            <a href="https://www.facebook.com/profile.php?id=61588517507057" target="_blank" className="builder-tag">[ Help to Builders ]</a>
            <div className="ms-partner">
              <span>Member of Microsoft for Startups</span>
              <img src="/wealthyai/icons/microsoft-logo-png-2395.png" alt="MS" />
            </div>
            <p className="copyright">© 2026 mywealthyai.com</p>
          </div>

          <div className="footer-right">
            <a href="mailto:info@mywealthyai.com" className="contact-link">
              <strong>Partnerships</strong><br/>
              <span>info@mywealthyai.com</span>
            </a>
            <div className="social-row">
              <a href="#"><img src="/wealthyai/icons/fb.png" alt="FB" /></a>
              <a href="#"><img src="/wealthyai/icons/x.png" alt="X" /></a>
              <a href="#"><img src="/wealthyai/icons/linkedin.png" alt="IN" /></a>
            </div>
          </div>
        </footer>

        {/* BOT TRAP */}
        <div style={{ opacity: 0, position: "absolute", zIndex: -1 }} aria-hidden="true">
          <input type="text" value={botValue} onChange={(e) => setBotValue(e.target.value)} tabIndex="-1" />
        </div>
        <div id="turnstile-container" style={{ position: "fixed", bottom: "20px", left: "20px", zIndex: 999, display: isVerified ? "none" : "block" }}></div>

        <style>{`
          .main-container {
            height: 100vh; width: 100%; position: relative; overflow: hidden;
            background: #04080f; color: white; display: flex; flex-direction: column;
            font-family: 'Inter', sans-serif;
          }
          .animated-bg {
            position: absolute; top: 0; left: 0; width: 200%; height: 200%;
            background: radial-gradient(circle at 50% 50%, #0a1a2f 0%, #04080f 70%);
            animation: drift 30s linear infinite; z-index: 0; opacity: 0.6;
          }
          @keyframes drift {
            from { transform: translate(-25%, -25%) rotate(0deg); }
            to { transform: translate(-25%, -25%) rotate(360deg); }
          }
          
          .header-wrapper { position: absolute; top: 20px; left: 40px; right: 40px; z-index: 20; display: flex; flex-direction: column; gap: 15px; }
          .top-nav { display: flex; align-items: center; gap: 30px; }
          .clock-group { display: flex; gap: 15px; }
          .secondary-nav { display: flex; gap: 20px; }

          .glass-link {
            font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.6);
            text-decoration: none; padding: 6px 12px; border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03);
            backdrop-filter: blur(5px); transition: all 0.3s ease;
          }
          .glass-link:hover { color: white; border-color: rgba(56,189,248,0.5); background: rgba(56,189,248,0.05); }

          .narrator-glass {
            position: fixed; top: 20px; right: 40px; z-index: 100;
            display: flex; align-items: center; gap: 12px; cursor: pointer;
            padding: 8px 16px; border-radius: 20px; background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);
            transition: all 0.3s ease;
          }
          .narrator-glass:hover { border-color: rgba(56,189,248,0.6); background: rgba(56,189,248,0.05); }
          .audio-visualizer { display: flex; gap: 3px; height: 12px; align-items: flex-end; }
          .bar { width: 2px; height: 3px; background: #38bdf8; }
          .bar.active { animation: barGrow 0.8s ease-in-out infinite alternate; }
          @keyframes barGrow { from { height: 3px; } to { height: 12px; } }
          .narrator-text { font-size: 9px; font-weight: 700; color: #38bdf8; text-transform: uppercase; }

          .hero-section { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 5; text-align: center; margin-top: -5vh; }
          .brand-logo { width: 800px; max-width: 85vw; animation: float 8s ease-in-out infinite; }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
          
          .hero-text-container { margin-top: -60px; }
          .hero-title { font-size: 1.8rem; font-weight: 200; opacity: 0.9; line-height: 1.3; }
          .hero-subline { display: flex; gap: 10px; justify-content: center; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.5; margin-top: 20px; }

          .action-area { position: absolute; bottom: 120px; left: 40px; z-index: 20; display: flex; flex-direction: column; gap: 15px; }
          .start-btn-modern {
            width: 140px; padding: 12px 0; background: #1a253a; border: 1px solid rgba(56,189,248,0.6);
            border-radius: 12px; color: white; text-decoration: none; text-align: center;
            display: flex; flex-direction: column; transition: all 0.4s ease;
            box-shadow: 0 0 20px rgba(56,189,248,0.1);
          }
          .start-btn-modern:hover { transform: translateY(-3px); box-shadow: 0 0 30px rgba(56,189,248,0.3); border-color: #38bdf8; }
          .btn-label { font-size: 1.2rem; font-weight: 700; }
          .btn-subtext { font-size: 7px; letter-spacing: 1px; opacity: 0.7; }

          .status-badge { display: flex; align-items: center; gap: 8px; font-size: 9px; color: #10b981; font-weight: 700; text-transform: uppercase; }
          .status-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; }
          .helper-text { font-size: 11px; opacity: 0.4; max-width: 200px; }

          .video-sidebar { position: absolute; right: 40px; bottom: 120px; z-index: 20; display: flex; flex-direction: column; align-items: center; gap: 10px; }
          .video-caption { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.4; }

          .footer-modern {
            position: absolute; bottom: 0; left: 0; width: 100%; padding: 25px 40px;
            display: flex; justify-content: space-between; align-items: flex-end; z-index: 10;
            background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          }
          .builder-tag { color: #38bdf8; text-decoration: none; font-size: 10px; font-weight: 600; border: 1px solid rgba(56,189,248,0.3); padding: 4px 8px; border-radius: 4px; }
          .ms-partner { display: flex; align-items: center; gap: 10px; font-size: 10px; opacity: 0.6; margin: 10px 0; }
          .ms-partner img { height: 18px; }
          .copyright { font-size: 10px; opacity: 0.3; }

          .contact-link { text-decoration: none; color: white; text-align: right; font-size: 11px; }
          .social-row { display: flex; gap: 15px; margin-top: 15px; }
          .social-row img { width: 24px; opacity: 0.6; transition: opacity 0.3s; }
          .social-row img:hover { opacity: 1; }

          @media (max-width: 768px) {
            .header-wrapper { top: 10px; left: 10px; right: 10px; align-items: center; }
            .top-nav { flex-direction: column; gap: 10px; }
            .hero-section { margin-top: 20px; }
            .hero-title { font-size: 1.2rem; }
            .action-area { position: relative; bottom: auto; left: auto; align-items: center; margin-bottom: 40px; }
            .footer-modern { flex-direction: column; align-items: center; text-align: center; gap: 20px; position: relative; }
            .contact-link { text-align: center; }
          }
        `}</style>
      </main>
    </>
  );
}
