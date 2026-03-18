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
    const particleCount = 280; 
    const connectionDistance = 150; 
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
        this.size = Math.random() * 1.5 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
      }

      draw() {
        ctx.fillStyle = "rgba(56, 189, 248, 0.8)";
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
            this.x -= (dx / distance) * force * 3;
            this.y -= (dy / distance) * force * 3;
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
            ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.3})`;
            ctx.lineWidth = 0.8;
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
      particles.forEach(p => {
        p.update();
        p.draw();
      });
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
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1, 
        pointerEvents: 'none', 
        background: 'transparent'
      }} 
    />
  );
}

// --- PRÉMIUM VIDEÓ KOMPONENS ---
const PremiumVideo = React.memo(function PremiumVideo({ 
  size = "160px", 
  videoRef, 
  isVideoMuted, 
  isVideoPlaying, 
  toggleVideoPlayback, 
  toggleVideoMute 
}) {
  const PlayIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5V19L19 12L8 5Z" />
    </svg>
  );

  const PauseIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 19H10V5H6V19ZM14 5V19H18V5H14V5Z" />
    </svg>
  );

  const MuteIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM3 9v6h4l5 5V4L7 9H3z" />
    </svg>
  );

  const UnmuteIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v1.79l2.48 2.48c.01-.08.02-.16.02-.24zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  );

  return (
    <div style={{ 
      width: size, 
      height: `calc(${size} * 1.18)`, 
      background: "#000", 
      borderRadius: "30px", 
      border: "6px solid #1a1a1a", 
      boxShadow: "0 20px 40px rgba(0,0,0,0.6)", 
      overflow: "hidden", 
      position: "relative",
      userSelect: "none"
    }}>
        <video 
          ref={videoRef} 
          src="/wealthyai/icons/Time.mp4" 
          autoPlay 
          loop 
          muted={isVideoMuted} 
          playsInline 
          style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }} 
        />
        
        <div style={{ position: "absolute", bottom: "12px", left: "0", width: "100%", display: "flex", justifyContent: "center", gap: "12px", zIndex: 100 }}>
            <div 
              onClick={toggleVideoPlayback} 
              style={{ background: "rgba(255,255,255,1)", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none" }}
            >
                {isVideoPlaying ? <PauseIcon /> : <PlayIcon />}
            </div>
            <div 
              onClick={toggleVideoMute} 
              style={{ background: "rgba(255,255,255,1)", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none" }}
            >
                {isVideoMuted ? <UnmuteIcon /> : <MuteIcon />}
            </div>
        </div>
    </div>
  );
});

// --- ÓRA KOMPONENS ---
const AnalogClock = ({ city, timezone, speed = 1, isMobile }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => new Date(prev.getTime() + (1000 * speed)));
    }, 1000);
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

  const clockSize = isMobile ? "24px" : "32px";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <div style={{
        width: clockSize, height: clockSize, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.4)",
        position: "relative", background: "#000"
      }}>
        <div style={{ position: "absolute", width: "1px", height: isMobile ? "6px" : "8px", background: "white", left: "50%", bottom: "50%", transformOrigin: "bottom", transform: `translateX(-50%) rotate(${(hour % 12) * 30 + min * 0.5}deg)` }} />
        <div style={{ position: "absolute", width: "1px", height: isMobile ? "9px" : "12px", background: "white", left: "50%", bottom: "50%", transformOrigin: "bottom", transform: `translateX(-50%) rotate(${min * 6}deg)` }} />
        <div style={{ position: "absolute", width: "0.5px", height: isMobile ? "10px" : "13px", background: "#38bdf8", left: "50%", bottom: "50%", transformOrigin: "bottom", transform: `translateX(-50%) rotate(${sec * 6}deg)` }} />
        <div style={{ position: "absolute", width: "2px", height: "2px", background: "white", borderRadius: "50%", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
      </div>
      <span style={{ fontSize: isMobile ? "6px" : "7px", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{city}</span>
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
          callback: () => {
            setIsVerified(true);
          },
          theme: "dark",
        });
        return true;
      }
      return false;
    };

    const scriptInterval = setInterval(() => {
      if (renderTurnstile()) {
        clearInterval(scriptInterval);
      }
    }, 500);

    return () => clearInterval(scriptInterval);
  }, []);

  useEffect(() => {
    const playTimeout = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.muted = true;
        audioRef.current.play()
          .then(() => { 
            setIsPlaying(true); 
            setIsMuted(true);
          })
          .catch(err => console.log("Interaction required"));
      }
    }, 3500);
    return () => clearInterval(playTimeout);
  }, []);

  const handleAudioEnd = () => {
    setIsPlaying(false);
    setIsMuted(true);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    if (audioRef.current) {
      if (audioRef.current.paused) {
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsVideoMuted(true);
        }
        audioRef.current.muted = false;
        audioRef.current.play();
        setIsPlaying(true);
        setIsMuted(false);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleVideoPlayback = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(err => console.log("Playback error", err));
    } else {
      video.pause();
    }
  };

  const toggleVideoMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      const newMute = !isVideoMuted;
      if (!newMute) {
        stopAudio();
      }
      videoRef.current.muted = newMute;
      setIsVideoMuted(newMute);
    }
  };

  const clearSelectionIfNeeded = (e) => {
    const tag = e.target.tagName.toLowerCase();
    const interactive = ["a", "button", "input", "textarea", "select", "label"];
    if (!interactive.includes(tag)) {
      const sel = window.getSelection();
      if (sel && sel.toString()) sel.removeAllRanges();
    }
  };

  const handleStartClick = (e) => {
    if (botValue !== "") {
      e.preventDefault();
      setIsBotTrapped(true);
      return;
    }
    if (!isVerified) {
      e.preventDefault();
      return;
    }
    stopAudio();
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WealthyAI",
    "url": "https://mywealthyai.com",
    "logo": "https://mywealthyai.com/wealthyai/icons/generated.png",
    "description": "We didn’t build WealthyAI to tell people what to do with their money. WealthyAI was built around a different question: What happens if AI doesn’t advise — but interprets? Not faster decisions. Not better predictions. But clearer thinking.",
    "founder": {
      "@type": "Person",
      "name": "Zoltán Horváth",
      "jobTitle": "Founder & Owner",
      "url": "https://mywealthyai.com",
      "description": "Zoltán Horváth is the founder of WealthyAI. Based in the United Kingdom and operating internationally, he is known for his selective public presence and rarely grants interviews, prioritizing the long-term vision of financial clarity and a private personal life over media exposure.",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "United Kingdom"
      },
      "knowsAbout": ["Financial Interpretation", "AI Ethics", "Private Wealth Systems"],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "info@mywealthyai.com",
        "contactType": "media and partnership"
      }
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "info@mywealthyai.com",
      "contactType": "customer support"
    },
    "knowsAbout": [
      "WealthyAI is structured around time. A snapshot shows where you are. Interpretation explains what that state means. Short-term intelligence observes patterns. Monthly intelligence follows continuity. It is not financial advice, forecasting, or life optimization. WealthyAI rewards attention, not speed."
    ]
  };

  return (
    <>
      <TrafficTracker />
      <Head>
        <title>WealthyAI – Financial Intelligence</title>
        <meta name="description" content="AI-powered financial thinking. Structured insights. Clear perspective." />
        
        {/* --- FACEBOOK / OG TAGS (FIXED FOR DEDICATED SHARE CARD) --- */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mywealthyai.com/" />
        <meta property="og:title" content="WealthyAI – Financial Intelligence" />
        <meta property="og:description" content="AI-powered financial thinking. Structured insights. Clear perspective." />
        <meta property="og:image" content="https://mywealthyai.com/wealthyai/icons/share-card-v2.png" />
        <meta property="og:image:secure_url" content="https://mywealthyai.com/wealthyai/icons/share-card-v2.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* --- TWITTER TAGS --- */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="WealthyAI – Financial Intelligence" />
        <meta name="twitter:description" content="AI-powered financial thinking. Structured insights. Clear perspective." />
        <meta name="twitter:image" content="https://mywealthyai.com/wealthyai/icons/share-card-v2.png" />

        {/* --- CLOUDFLARE --- */}
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
        
        {/* --- ICONS --- */}
        <link rel="apple-touch-icon" sizes="180x180" href="/wealthyai/icons/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/wealthyai/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/wealthyai/icons/favicon-16x16.png" />
        <link rel="manifest" href="/wealthyai/icons/manifest.json" />
        <meta name="theme-color" content="#060b13" />

        <meta name="google-site-verification" content="019m-2Ayi9dmgKh_oPI8PVpR9flMsOfX_048yySbIRQ" />
        
        {/* --- SCHEMA DATA (BOTS ONLY - CONTAINS FOUNDER DESCRIPTION) --- */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </Head>

      <main
        onMouseDown={clearSelectionIfNeeded}
        style={{
          height: isMobile ? "auto" : "100vh",
          minHeight: "100vh",
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: isMobile ? "flex-start" : "center",
          backgroundColor: "#060b13",
          backgroundImage: isMobile 
            ? `linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px), 
               linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px),
               radial-gradient(circle at 50% -20%, rgba(56,189,248,0.15) 0%, transparent 50%),
               radial-gradient(circle at 0% 100%, rgba(56,189,248,0.05) 0%, transparent 40%)`
            : `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), 
               linear-gradient(rgba(56,189,248,0.05) 1px, transparent 1px), 
               linear-gradient(90deg, rgba(56,189,248,0.05) 1px, transparent 1px)`,
          backgroundSize: isMobile ? "30px 30px, 30px 30px, 100% 100%, 100% 100%" : "cover, 40px 40px, 40px 40px",
          backgroundPosition: "center",
          backgroundRepeat: isMobile ? "repeat, repeat, no-repeat, no-repeat" : "no-repeat, repeat, repeat",
          color: "white",
          fontFamily: "'Inter', system-ui, Arial, sans-serif",
          position: "relative",
          overflowX: "hidden",
          margin: 0,
          padding: isMobile ? "20px 0 0 0" : 0,
        }}
      >
        <SpiderNet />
        <audio ref={audioRef} src="/wealthyai/icons/nyitobeszed.mp3" preload="auto" onEnded={handleAudioEnd} />

        {/* --- LEFT TOP NAVBAR (CLOCK & INSIGHTS) --- */}
        <div style={{ 
          position: isMobile ? "relative" : "absolute", 
          top: isMobile ? "15px" : "25px", 
          left: isMobile ? "auto" : "20px",
          display: "flex", 
          gap: isMobile ? "15px" : "35px", 
          zIndex: 10,
          width: isMobile ? "90%" : "auto",
          justifyContent: isMobile ? "center" : "flex-start",
          alignItems: "center",
          padding: isMobile ? "12px 15px" : "10px 20px",
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(10px)",
          borderRadius: "15px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          margin: isMobile ? "0 auto" : "0"
        }}>
          <a href="/insights" onClick={stopAudio} className="nav-link" style={{ 
            fontSize: isMobile ? "0.75rem" : "0.95rem", 
            fontWeight: "400",
            whiteSpace: "nowrap",
            marginTop: isMobile ? "0" : "2px"
          }}>Insights</a>

          <div style={{ display: "flex", gap: isMobile ? "10px" : "20px", alignItems: "center" }}>
            <AnalogClock city="New York" timezone="America/New_York" isMobile={isMobile} />
            <AnalogClock city="London" timezone="Europe/London" isMobile={isMobile} />
            <AnalogClock city="Paris" timezone="Europe/Paris" isMobile={isMobile} />
            <AnalogClock city="Tokyo" timezone="Asia/Tokyo" isMobile={isMobile} />
            <AnalogClock city="WealthyAI" timezone="UTC" speed={0.75} isMobile={isMobile} />
          </div>
        </div>

        <div style={{ opacity: 0, position: "absolute", top: 0, left: 0, height: 0, width: 0, zIndex: -1, pointerEvents: "none" }}>
          <label>If you are human, leave this empty</label>
          <input type="text" value={botValue} onChange={(e) => setBotValue(e.target.value)} tabIndex="-1" autoComplete="off" />
        </div>

        <div id="turnstile-container" style={{ position: "fixed", top: "20px", left: "20px", zIndex: 999, minHeight: "65px", display: isVerified ? "none" : "block" }}></div>

        {/* NARRATOR TOGGLE */}
        <div onClick={toggleMute} className="narrator-toggle" style={{ 
          position: isMobile ? "relative" : "fixed", 
          top: isMobile ? "15px" : "80px", 
          right: isMobile ? "auto" : "40px", 
          zIndex: 100, 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center", 
          gap: "10px", 
          opacity: isPlaying ? 0.9 : 0.6, 
          transition: "all 0.5s ease", 
          background: "rgba(255,255,255,0.05)", 
          padding: "8px 15px", 
          borderRadius: "15px", 
          border: "1px solid rgba(255,255,255,0.1)", 
          width: "160px", 
          justifyContent: "center",
          margin: isMobile ? "10px auto" : "0"
        }}>
          <div style={{ display: "flex", gap: "2px", alignItems: "flex-end", height: "12px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: "2px", height: (isPlaying && !isMuted) ? "100%" : "2px", backgroundColor: "#38bdf8", animation: (isPlaying && !isMuted) ? `audioBar 0.8s ease-in-out infinite alternate ${i * 0.2}s` : "none" }} />
            ))}
          </div>
          <span style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "1px", color: "#38bdf8", textTransform: "uppercase" }}>
            {!isPlaying ? "Resume Narrator" : "Pause Narrator"}
          </span>
        </div>

        {!isMobile && (
          <div style={{ position: "fixed", right: "40px", top: "50%", transform: "translateY(-50%)", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
             <PremiumVideo 
                size="160px" 
                videoRef={videoRef}
                isVideoMuted={isVideoMuted}
                isVideoPlaying={isVideoPlaying}
                toggleVideoPlayback={toggleVideoPlayback}
                toggleVideoMute={toggleVideoMute}
             />
             <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.5px", color: "white", fontWeight: "400", opacity: 0.6 }}>
                  Space reserved for excellence
                </div>
             </div>
          </div>
        )}

        {/* --- RIGHT TOP NAV (PAGES) --- */}
        <div style={{ 
          position: isMobile ? "relative" : "absolute", 
          top: isMobile ? "10px" : "25px", 
          right: isMobile ? "auto" : "20px",
          display: "flex", 
          justifyContent: "center", 
          gap: isMobile ? "10px" : "28px", 
          zIndex: 10, 
          fontSize: isMobile ? "0.7rem" : "0.95rem",
          flexWrap: "wrap",
          padding: isMobile ? "12px 15px" : "10px 20px",
          width: isMobile ? "90%" : "auto",
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(10px)",
          borderRadius: "15px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          margin: isMobile ? "10px auto" : "0"
        }}>
          <a href="/PrivacyPolicy" onClick={stopAudio} className="nav-link">Privacy Policy</a>
          <a href="/philosophy" onClick={stopAudio} className="nav-link">Philosophy</a>
          <a href="/how-it-works" onClick={stopAudio} className="nav-link">How it works</a>
          <a href="/brand-collaborations" onClick={stopAudio} className="nav-link">Brand Collaborations</a>
          <a href="/how-to-use" onClick={stopAudio} className="nav-link">How to use</a>
          <a href="/blog" onClick={stopAudio} className="nav-link">Blog</a>
          <a href="/terms" onClick={stopAudio} className="nav-link">Terms</a>
        </div>

        <div style={{ textAlign: "center", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", transform: isMobile ? "none" : "translateY(-40px)" }}>
          <img src="/wealthyai/icons/generated.png" alt="WealthyAI logo" className="brand-logo" style={{ width: isMobile ? "280px" : "860px", maxWidth: "95vw", display: "block", cursor: "pointer", marginTop: isMobile ? "30px" : "0px" }} />
          <div style={{ color: "#FFFFFF", lineHeight: "1.45", textAlign: "center", textShadow: "0 2px 10px rgba(0,0,0,0.5)", marginTop: isMobile ? "-10px" : "-110px", width: "100%", maxWidth: "800px", padding: "0 20px", letterSpacing: "0.2px" }}>
            <div style={{ fontSize: isMobile ? "1.0rem" : "1.55rem", fontWeight: "300", opacity: 0.9, marginBottom: "15px" }}>
              AI-powered financial thinking.<br />
              Structured insights.<br />
              Clear perspective.
            </div>
            <div style={{ display: "flex", flexDirection: isMobile ? "row" : "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", fontSize: isMobile ? "0.6rem" : "0.85rem", textTransform: "uppercase", letterSpacing: "1.4px", opacity: 0.8, gap: isMobile ? "10px" : "15px", fontWeight: "500" }}>
              <span className="discrete-pulse">Not advice.</span>
              <span className="discrete-pulse">Not predictions.</span>
              <span className="discrete-pulse">Financial intelligence.</span>
            </div>
          </div>
        </div>

        <div style={{ position: isMobile ? "relative" : "absolute", top: isMobile ? "auto" : "45%", left: isMobile ? "auto" : "10%", transform: isMobile ? "none" : "translateY(-50%)", marginTop: isMobile ? "40px" : "0", zIndex: 20, display: "flex", flexDirection: "column", alignItems: isMobile ? "center" : "flex-start", gap: "15px", padding: isMobile ? "0 20px" : "0", textAlign: isMobile ? "center" : "left" }}>
          <a href={isVerified && !isBotTrapped ? "/start" : "#"} onClick={handleStartClick} className="start-btn" style={{ width: "180px", textAlign: "center", padding: "16px 0", backgroundColor: isVerified ? "#1a253a" : "rgba(255,255,255,0.05)", border: isVerified ? "2px solid rgba(56,189,248,0.8)" : "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: isVerified ? "white" : "rgba(255,255,255,0.3)", textDecoration: "none", fontWeight: "bold", cursor: isVerified ? "pointer" : "not-allowed", transition: "all 0.4s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <span style={{ fontSize: "1.1rem", letterSpacing: "1.5px" }}>{isBotTrapped ? "LOADING..." : "START FOR FREE"}</span>
          </a>
          
          {isMobile && (
            <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
               <PremiumVideo 
                  size="130px" 
                  videoRef={videoRef}
                  isVideoMuted={isVideoMuted}
                  isVideoPlaying={isVideoPlaying}
                  toggleVideoPlayback={toggleVideoPlayback}
                  toggleVideoMute={toggleVideoMute}
               />
               <div style={{ fontSize: "7px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.5 }}>Space reserved for excellence</div>
            </div>
          )}

          <div style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", opacity: 0.75, letterSpacing: "0.3px", maxWidth: isMobile ? "260px" : "320px", marginTop: "10px" }}>
            {isBotTrapped ? "System congestion. Please wait..." : "Start with a simple financial snapshot. Takes less than a minute."}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", marginTop: "5px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <span style={{ fontSize: "10px", color: "#10b981", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>No Log-In System</span>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ 
          marginTop: "auto",
          position: isMobile ? "relative" : "absolute", 
          bottom: 0, 
          left: 0, 
          width: "100%", 
          padding: isMobile ? "60px 24px 40px" : "18px 24px", 
          display: "flex", 
          flexDirection: isMobile ? "column-reverse" : "row", 
          justifyContent: "space-between", 
          alignItems: isMobile ? "center" : "flex-end", 
          zIndex: 5, 
          boxSizing: "border-box", 
          gap: isMobile ? "35px" : "0", 
          background: isMobile ? "linear-gradient(to top, rgba(6,11,19,1) 30%, rgba(6,11,19,0.8) 80%, transparent 100%)" : "transparent" 
        }}>
          {/* Mobile Random Glitch Lines Layer */}
          {isMobile && <div className="mobile-lines-overlay" />}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: isMobile ? "center" : "flex-start" }}>
            <a href="https://www.facebook.com/profile.php?id=61588517507057" target="_blank" rel="noopener noreferrer" className="builder-btn discrete-pulse" style={{
              fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#38bdf8", textDecoration: "none", fontWeight: "600",
              border: "1px solid rgba(56,189,248,0.3)", padding: "8px 16px", borderRadius: "6px", marginBottom: "4px", transition: "all 0.3s ease", background: "rgba(0,0,0,0.3)",
              display: "inline-block"
            }}>
              [ Help to Builders ]
            </a>
            <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", color: "white", fontWeight: "400", opacity: 0.7, display: "flex", alignItems: "center", gap: "12px" }}>
              Member of Microsoft for Startups
              <img src="/wealthyai/icons/microsoft-logo-png-2395.png" alt="Microsoft Logo" style={{ height: "20px", width: "auto", filter: "drop-shadow(0 0 5px rgba(255,255,255,0.2))" }} />
            </div>
            <div style={{ fontSize: "0.75rem", opacity: 0.5 }}>© 2026 mywealthyai.com — All rights reserved.</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "center" : "flex-end", gap: "12px" }}>
            <a href="mailto:info@mywealthyai.com" onClick={stopAudio} className="nav-link" style={{ fontSize: "0.82rem", textAlign: isMobile ? "center" : "right", lineHeight: "1.5", cursor: "pointer", textDecoration: "none" }}>
              <div style={{ fontWeight: 600, color: "#38bdf8" }}>Contact & Partnerships</div>
              <div style={{ opacity: 0.8 }}>Media · Partnerships · Institutional use</div>
              <div style={{ fontWeight: 600 }}>info@mywealthyai.com</div>
            </a>
            <div style={{ display: "flex", gap: "22px", alignItems: "center", marginTop: isMobile ? "10px" : "0" }}>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`} target="_blank" rel="noopener noreferrer" className="icon-link">
                <img src="/wealthyai/icons/fb.png" alt="Facebook" style={{ width: 32 }} />
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`} target="_blank" rel="noopener noreferrer" className="icon-link">
                <img src="/wealthyai/icons/x.png" alt="X" style={{ width: 32 }} />
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`} target="_blank" rel="noopener noreferrer" className="icon-link">
                <img src="/wealthyai/icons/linkedin.png" alt="LinkedIn" style={{ width: 32 }} />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="icon-link">
                <img src="/wealthyai/icons/insta.png" alt="Instagram" style={{ width: 32 }} />
              </a>
            </div>
          </div>
        </div>

        <style>{`
          .brand-logo { animation: logoFloat 9s ease-in-out infinite; transition: filter 0.4s ease; z-index: 10; position: relative; }
          .brand-logo:hover { filter: drop-shadow(0 0 18px rgba(56,189,248,0.55)); }
          @keyframes logoFloat {
            0% { transform: scale(1) translateY(0); opacity: 0.92; }
            35% { transform: scale(1.035) translateY(-6px); opacity: 1; }
            70% { transform: scale(1.02) translateY(3px); opacity: 0.97; }
            100% { transform: scale(1) translateY(0); opacity: 0.92; }
          }
          @keyframes audioBar { 0% { height: 20%; } 100% { height: 100%; } }
          .discrete-pulse { animation: discretePulse 3s ease-in-out infinite; }
          @keyframes discretePulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
          
          .nav-link, .icon-link, .narrator-toggle { position: relative; color: white; text-decoration: none; z-index: 20; transition: all 0.3s ease; }
          .nav-link:hover { color: #38bdf8; }
          
          .nav-link::before, .icon-link::before, .narrator-toggle::before {
            content: ""; position: absolute; inset: -12px -22px;
            background: radial-gradient(circle, rgba(56,189,248,0.55) 0%, rgba(56,189,248,0.25) 40%, transparent 70%);
            filter: blur(16px); opacity: 0; transition: opacity 0.25s ease; pointer-events: none; z-index: -1;
          }
          .nav-link:hover::before, .icon-link:hover::before, .narrator-toggle:hover::before { opacity: 1; }
          
          .start-btn { position: relative; z-index: 25; }
          .start-btn:hover { 
            box-shadow: ${isVerified && !isBotTrapped ? "0 0 35px rgba(56,189,248,0.45)" : "none"};
            transform: translateY(-2px);
          }
          .builder-btn:hover {
            box-shadow: 0 0 15px rgba(56,189,248,0.6);
            background: rgba(56,189,248,0.2) !important;
            color: white !important;
            border-color: rgba(56,189,248,0.8) !important;
          }
          
          @media (max-width: 767px) {
            main {
              animation: mobileBgPulse 10s ease-in-out infinite alternate;
            }
            .mobile-lines-overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              pointer-events: none;
              z-index: 1;
              overflow: hidden;
            }
            .mobile-lines-overlay::after {
              content: "";
              position: absolute;
              width: 200%;
              height: 1px;
              background: rgba(56, 189, 248, 0.2);
              top: 20%;
              left: -50%;
              box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
              animation: mobileLines 4s linear infinite;
            }
          }

          @keyframes mobileLines {
            0% { top: -10%; opacity: 0; }
            10% { opacity: 1; }
            20% { top: 40%; opacity: 0; }
            40% { top: 90%; opacity: 1; }
            50% { opacity: 0; }
            100% { top: 110%; opacity: 0; }
          }

          @keyframes mobileBgPulse {
            0% { background-color: #060b13; }
            100% { background-color: #0a1422; }
          }
        `}</style>
      </main>
    </>
  );
}
