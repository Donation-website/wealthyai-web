import React, { useState, useEffect, useRef } from "react";
import SEO from "../components/SEO";
import Head from "next/head";
import TrafficTracker from "../components/TrafficTracker";

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
    if (speed !== 1) return time; // WealthyAI lassított idő
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
    return () => window.removeResizeListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const renderTurnstile = () => {
      if (window.turnstile && document.getElementById("turnstile-container")) {
        window.turnstile.render("#turnstile-container", {
          sitekey: "0x4AAAAAACfHxdcNLlIOQCJF",
          appearance: "always",
          callback: () => {
            console.log("Verifikáció sikeres!");
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
          .then(() => { setIsPlaying(true); })
          .catch(err => console.log("Interaction required"));
      }
    }, 3500);
    return () => {
      clearTimeout(playTimeout);
      if (audioRef.current) audioRef.current.pause();
    };
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

  const toggleMute = () => {
    if (audioRef.current) {
      if (!isPlaying) {
        audioRef.current.currentTime = 0;
        audioRef.current.muted = false;
        audioRef.current.play();
        setIsPlaying(true);
        setIsMuted(false);
      } else {
        const newMuteState = !isMuted;
        audioRef.current.muted = newMuteState;
        setIsMuted(newMuteState);
      }
    }
  };

  const toggleVideoPlayback = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleVideoMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMute = !isVideoMuted;
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

  // Reusable Video Component for Desktop/Mobile
  const PremiumVideo = ({ size = "160px" }) => (
    <div style={{ width: size, height: `calc(${size} * 1.18)`, background: "#000", borderRadius: "30px", border: "6px solid #1a1a1a", boxShadow: "0 20px 40px rgba(0,0,0,0.6)", overflow: "hidden", position: "relative" }}>
        <video ref={videoRef} src="/wealthyai/icons/Time.mp4" autoPlay loop muted={isVideoMuted} playsInline style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }} />
        
        <div style={{ position: "absolute", bottom: "10px", left: "0", width: "100%", display: "flex", justifyContent: "center", gap: "15px", zIndex: 10 }}>
            <div onClick={toggleVideoPlayback} style={{ background: "rgba(0,0,0,0.5)", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }}>
                <span style={{ fontSize: "10px", opacity: 0.8 }}>{isVideoPlaying ? "⏸" : "▶"}</span>
            </div>
            <div onClick={toggleVideoMute} style={{ background: "rgba(0,0,0,0.5)", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }}>
                <span style={{ fontSize: "10px", opacity: 0.8 }}>{isVideoMuted ? "🔇" : "🔊"}</span>
            </div>
        </div>
    </div>
  );

  return (
    <>
      <TrafficTracker />
      <Head>
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
        <meta name="google-site-verification" content="019m-2Ayi9dmgKh_oPI8PVpR9flMsOfX_048yySbIRQ" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content="WealthyAI – AI-powered financial clarity" />
        <meta property="og:description" content="AI-powered financial thinking. Structured insights. Clear perspective." />
        <meta property="og:image" content="https://mywealthyai.com/wealthyai/icons/share-card.png?v=5" />
        <meta property="og:image:secure_url" content="https://mywealthyai.com/wealthyai/icons/share-card.png?v=5" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://mywealthyai.com/wealthyai/icons/share-card.png?v=5" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "WealthyAI",
            "url": "https://mywealthyai.com",
            "logo": "https://mywealthyai.com/wealthyai/icons/generated.png",
            "description": "WealthyAI provides financial interpretation, not advice. We aim for clearer thinking through time-based intelligence and structured insights, supporting human judgment quietly over time.",
            "founder": {
              "@type": "Person",
              "name": "Zoltán Horváth",
              "jobTitle": "Founder & Owner",
              "description": "Entrepreneur who lived and worked in the United Kingdom for a decade. He maintains a private profile and is primarily active on LinkedIn. For inquiries: info@mywealthyai.com",
              "url": "https://www.linkedin.com/sharing/share-offsite/?url=https://mywealthyai.com"
            },
            "knowsAbout": [
              "Financial Intelligence",
              "AI Interpretation",
              "Structured Thinking",
              "Market Perspective"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "info@mywealthyai.com",
              "contactType": "customer support"
            }
          })}
        </script>
      </Head>
      <SEO
        title="WealthyAI – AI-powered financial clarity | mywealthyai"
        description="WealthyAI (mywealthyai) offers AI-powered financial planning, structured insights, and clear market perspective."
        url={SITE_URL}
        keywords="mywealthyai, WealthyAI, AI finance, financial intelligence, structured insights, market perspective, financial clarity"
      />

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
          backgroundImage: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/wealthyai/wealthyai.png')",
          backgroundPosition: isMobile ? "center 22%" : "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          color: "white",
          fontFamily: "'Inter', system-ui, Arial, sans-serif",
          position: "relative",
          overflowX: "hidden",
          margin: 0,
          padding: isMobile ? "80px 0 60px 0" : 0,
        }}
      >
        <audio ref={audioRef} src="/wealthyai/icons/nyitobeszed.mp3" preload="auto" onEnded={handleAudioEnd} />

        {/* WORLD CLOCKS BAR */}
        <div style={{ 
          position: "absolute", 
          top: isMobile ? "15px" : "25px", 
          left: isMobile ? "50%" : "150px", 
          transform: isMobile ? "translateX(-50%)" : "none",
          display: "flex", 
          gap: isMobile ? "10px" : "20px", 
          zIndex: 10,
          width: isMobile ? "100%" : "auto",
          justifyContent: isMobile ? "center" : "flex-start"
        }}>
          <AnalogClock city="New York" timezone="America/New_York" isMobile={isMobile} />
          <AnalogClock city="London" timezone="Europe/London" isMobile={isMobile} />
          <AnalogClock city="Paris" timezone="Europe/Paris" isMobile={isMobile} />
          <AnalogClock city="Tokyo" timezone="Asia/Tokyo" isMobile={isMobile} />
          <AnalogClock city="WealthyAI" timezone="UTC" speed={0.75} isMobile={isMobile} />
        </div>

        {/* Honeypot for bots */}
        <div style={{ opacity: 0, position: "absolute", top: 0, left: 0, height: 0, width: 0, zIndex: -1, pointerEvents: "none" }}>
          <label>If you are human, leave this empty</label>
          <input type="text" value={botValue} onChange={(e) => setBotValue(e.target.value)} tabIndex="-1" autoComplete="off" />
        </div>

        {/* Cloudflare Turnstile */}
        <div id="turnstile-container" style={{ position: "fixed", top: "20px", left: "20px", zIndex: 999, minHeight: "65px", display: isVerified ? "none" : "block" }}></div>

        {/* Narrator Toggle */}
        <div onClick={toggleMute} className="narrator-toggle" style={{ position: "fixed", top: isMobile ? "65px" : "80px", right: isMobile ? "20px" : "40px", zIndex: 100, cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", opacity: isPlaying ? 0.9 : 0.6, transition: "all 0.5s ease", background: "rgba(255,255,255,0.05)", padding: "5px 12px", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", gap: "2px", alignItems: "flex-end", height: "12px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: "2px", height: (isPlaying && !isMuted) ? "100%" : "2px", backgroundColor: "#38bdf8", animation: (isPlaying && !isMuted) ? `audioBar 0.8s ease-in-out infinite alternate ${i * 0.2}s` : "none" }} />
            ))}
          </div>
          <span style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "1px", color: "#38bdf8", textTransform: "uppercase" }}>
            {!isPlaying ? "Start Narrator" : isMuted ? "Unmute Narrator" : "Mute"}
          </span>
        </div>

        {/* DESKTOP FEATURED AD VIDEO */}
        {!isMobile && (
          <div style={{ position: "fixed", right: "40px", top: "50%", transform: "translateY(-50%)", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
             <PremiumVideo size="160px" />
             <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.5px", color: "white", fontWeight: "400", opacity: 0.6, fontFamily: "'Inter', sans-serif" }}>
                  Space reserved for excellence
                </div>
             </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ 
          position: isMobile ? "relative" : "absolute", 
          top: isMobile ? "10px" : "30px", 
          right: isMobile ? "auto" : "40px", 
          display: "flex", 
          justifyContent: "center", 
          gap: isMobile ? "12px" : "28px", 
          zIndex: 6, 
          fontSize: isMobile ? "0.75rem" : "0.95rem",
          flexWrap: isMobile ? "wrap" : "nowrap",
          padding: isMobile ? "0 20px" : "0",
          maxWidth: isMobile ? "100%" : "auto"
        }}>
          <a href="/philosophy" onClick={stopAudio} className="nav-link">Philosophy</a>
          <a href="/how-it-works" onClick={stopAudio} className="nav-link">How it works</a>
          <a href="/brand-collaborations" onClick={stopAudio} className="nav-link">Brand Collaborations</a>
          <a href="/how-to-use" onClick={stopAudio} className="nav-link">How to use</a>
          <a href="/blog" onClick={stopAudio} className="nav-link">Blog</a>
          <a href="/terms" onClick={stopAudio} className="nav-link">Terms</a>
        </div>

        {/* Logo and Slogan Section */}
        <div style={{ textAlign: "center", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", transform: isMobile ? "none" : "translateY(-40px)" }}>
          <img src="/wealthyai/icons/generated.png" alt="WealthyAI logo" className="brand-logo" style={{ width: isMobile ? "320px" : "860px", maxWidth: "95vw", display: "block", cursor: "pointer", marginTop: isMobile ? "40px" : "0px" }} />
          <div style={{ color: "#FFFFFF", lineHeight: "1.45", textAlign: "center", textShadow: "0 2px 10px rgba(0,0,0,0.5)", marginTop: isMobile ? "0px" : "-110px", width: "100%", maxWidth: "800px", padding: "0 20px", letterSpacing: "0.2px" }}>
            <div style={{ fontSize: isMobile ? "1.1rem" : "1.55rem", fontWeight: "300", opacity: 0.9, marginBottom: "15px" }}>
              AI-powered financial thinking.<br />
              Structured insights.<br />
              Clear perspective.
            </div>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "center", alignItems: "center", fontSize: isMobile ? "0.7rem" : "0.85rem", textTransform: "uppercase", letterSpacing: "1.4px", opacity: 0.8, gap: isMobile ? "8px" : "15px", fontWeight: "500" }}>
              <span className="discrete-pulse">Not advice.</span>
              <span className="discrete-pulse">Not predictions.</span>
              <span className="discrete-pulse">Financial intelligence.</span>
            </div>
          </div>
        </div>

        {/* CTA Section (Start Button) */}
        <div style={{ position: isMobile ? "relative" : "absolute", top: isMobile ? "auto" : "45%", left: isMobile ? "auto" : "10%", transform: isMobile ? "none" : "translateY(-50%)", marginTop: isMobile ? "40px" : "0", zIndex: 20, display: "flex", flexDirection: "column", alignItems: isMobile ? "center" : "flex-start", gap: "15px", padding: isMobile ? "0 20px" : "0", textAlign: isMobile ? "center" : "left" }}>
          <a href={isVerified && !isBotTrapped ? "/start" : "#"} onClick={handleStartClick} className="start-btn" style={{ width: "130px", textAlign: "center", padding: "14px 0", backgroundColor: isVerified ? "#1a253a" : "rgba(255,255,255,0.05)", border: isVerified ? "1px solid rgba(56,189,248,0.8)" : "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: isVerified ? "white" : "rgba(255,255,255,0.3)", textDecoration: "none", fontWeight: "bold", fontSize: "1.1rem", cursor: isVerified ? "pointer" : "not-allowed", transition: "all 0.4s ease" }}>
            {isBotTrapped ? "Loading..." : "Start"}
          </a>
          
          {/* MOBILE VIDEO - Under Start Button */}
          {isMobile && (
            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
               <PremiumVideo size="120px" />
            </div>
          )}

          <div style={{ fontSize: "0.85rem", opacity: 0.75, letterSpacing: "0.3px", maxWidth: isMobile ? "280px" : "320px" }}>
            {isBotTrapped ? "System congestion. Please wait..." : "Start with a simple financial snapshot. Takes less than a minute."}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", marginTop: "5px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <span style={{ fontSize: "10px", color: "#10b981", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>No Log-In System</span>
          </div>
        </div>

        {/* Footer Section */}
        <div style={{ position: isMobile ? "relative" : "absolute", bottom: 0, left: 0, width: "100%", padding: isMobile ? "36px 24px 24px" : "18px 24px", display: "flex", flexDirection: isMobile ? "column-reverse" : "row", justifyContent: "space-between", alignItems: isMobile ? "center" : "flex-end", zIndex: 5, boxSizing: "border-box", gap: isMobile ? "30px" : "0", background: isMobile ? "linear-gradient(to top, rgba(6,11,19,0.95) 0%, rgba(6,11,19,0.8) 50%, rgba(6,11,19,0.0) 100%)" : "transparent" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: isMobile ? "center" : "flex-start" }}>
            
            <a href="https://www.facebook.com/profile.php?id=61588517507057" target="_blank" rel="noopener noreferrer" className="builder-btn discrete-pulse" style={{
              fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#38bdf8", textDecoration: "none", fontWeight: "600",
              border: "1px solid rgba(56,189,248,0.3)", padding: "6px 12px", borderRadius: "4px", marginBottom: "4px", transition: "all 0.3s ease", background: "rgba(0,0,0,0.3)",
              display: "inline-block"
            }}>
              [ Help to Builders ]
            </a>

            <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", color: "white", fontWeight: "400", opacity: 0.7, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: "12px" }}>
              Member of Microsoft for Startups
              <img src="/wealthyai/icons/microsoft-logo-png-2395.png" alt="Microsoft Logo" style={{ height: "24px", width: "auto", display: "inline-block", filter: "drop-shadow(0 0 5px rgba(255,255,255,0.2))" }} />
            </div>
            <div style={{ fontSize: "0.85rem", opacity: 0.6 }}>© 2026 mywealthyai.com — All rights reserved.</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "center" : "flex-end", gap: "8px" }}>
            <a href="mailto:info@mywealthyai.com" onClick={stopAudio} className="nav-link" style={{ fontSize: "0.82rem", textAlign: isMobile ? "center" : "right", lineHeight: "1.4", cursor: "pointer", textDecoration: "none" }}>
              <div style={{ fontWeight: 500 }}>Contact & Partnerships</div>
              <div style={{ opacity: 0.8 }}>Media · Partnerships · Institutional use</div>
              <div style={{ fontWeight: 600 }}>info@mywealthyai.com</div>
            </a>
            <div style={{ display: "flex", gap: "18px", alignItems: "center", marginTop: isMobile ? "10px" : "0" }}>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`} target="_blank" rel="noopener noreferrer" onClick={stopAudio} className="icon-link">
                <img src="/wealthyai/icons/fb.png" alt="Facebook" style={{ width: 34 }} />
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`} target="_blank" rel="noopener noreferrer" onClick={stopAudio} className="icon-link">
                <img src="/wealthyai/icons/x.png" alt="X" style={{ width: 34 }} />
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`} target="_blank" rel="noopener noreferrer" onClick={stopAudio} className="icon-link">
                <img src="/wealthyai/icons/linkedin.png" alt="LinkedIn" style={{ width: 34 }} />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" onClick={stopAudio} className="icon-link">
                <img src="/wealthyai/icons/insta.png" alt="Instagram" style={{ width: 34 }} />
              </a>
            </div>
          </div>
        </div>

        <style>{`
          .brand-logo { animation: logoFloat 9s ease-in-out infinite; transition: filter 0.4s ease; }
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
          .nav-link, .icon-link { position: relative; color: white; text-decoration: none; opacity: 0.85; }
          .nav-link::before, .icon-link::before {
            content: ""; position: absolute; inset: -12px -22px;
            background: radial-gradient(circle, rgba(56,189,248,0.55) 0%, rgba(56,189,248,0.25) 40%, transparent 70%);
            filter: blur(16px); opacity: 0; transition: opacity 0.25s ease; pointer-events: none; z-index: -1;
          }
          .nav-link:hover::before, .icon-link:hover::before { opacity: 1; }
          .start-btn:hover { box-shadow: ${isVerified && !isBotTrapped ? "0 0 35px rgba(56,189,248,0.45)" : "none"}; }
          
          .builder-btn:hover {
            box-shadow: 0 0 15px rgba(56,189,248,0.6);
            background: rgba(56,189,248,0.2) !important;
            color: white !important;
            border-color: rgba(56,189,248,0.8) !important;
          }
        `}</style>
      </main>
    </>
  );
}
