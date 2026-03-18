import React, { useState, useEffect, useRef, useMemo } from "react";
import SEO from "../components/SEO";
import Head from "next/head";
import TrafficTracker from "../components/TrafficTracker";

/* ==========================================================
   1. ANIMATED BACKGROUND COMPONENTS (GRID + SPIDER + NODES)
   ========================================================== */
const BackgroundSystem = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.size = Math.random() * 1.5 + 0.5;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.fillStyle = "rgba(56, 189, 248, 0.3)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = Array.from({ length: 80 }, () => new Particle());
    };

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("resize", resize);
    resize();
    init();
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="bg-container">
      <div className="grid-layer"></div>
      <canvas ref={canvasRef} className="canvas-layer" />
      <style jsx>{`
        .bg-container { position: fixed; inset: 0; z-index: 0; background: #020617; }
        .grid-layer {
          position: absolute; inset: 0;
          background-image: 
            linear-gradient(to right, rgba(56, 189, 248, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(circle at center, black, transparent 90%);
        }
        .canvas-layer { position: absolute; inset: 0; }
      `}</style>
    </div>
  );
};

/* ==========================================================
   2. CLOCK COMPONENT (GLOBAL INTELLIGENCE)
   ========================================================== */
const GlobalClock = ({ city, tz }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString("en-US", { 
    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false 
  });

  return (
    <div className="clock-box">
      <span className="city">{city}</span>
      <span className="time">{timeStr}</span>
      <style jsx>{`
        .clock-box { display: flex; flex-direction: column; align-items: flex-start; min-width: 60px; }
        .city { font-size: 8px; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8; font-weight: 700; }
        .time { font-size: 12px; font-family: 'Courier New', monospace; opacity: 0.8; }
      `}</style>
    </div>
  );
};

/* ==========================================================
   3. MAIN PAGE COMPONENT
   ========================================================== */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="site-wrapper">
      <Head>
        <title>WealthyAI | AI Financial Intelligence</title>
        <meta name="description" content="Interpreting financial data for a clearer perspective." />
      </Head>
      
      <TrafficTracker />
      <BackgroundSystem />

      {/* --- HEADER --- */}
      <header className={`header ${scrolled ? 'active' : ''}`}>
        <div className="header-inner">
          <div className="nav-group">
            <a href="/insights" className="nav-link">Insights</a>
            <a href="/philosophy" className="nav-link">Philosophy</a>
          </div>

          <div className="clock-display">
            <GlobalClock city="NYC" tz="America/New_York" />
            <GlobalClock city="LDN" tz="Europe/London" />
            <GlobalClock city="TYO" tz="Asia/Tokyo" />
            <GlobalClock city="W-AI" tz="UTC" />
          </div>

          <div className="nav-group right">
            <a href="/blog" className="nav-link">Blog</a>
            <a href="/how-it-works" className="nav-link border">Process</a>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="content-root">
        <section className="hero-section">
          <div className="logo-container">
            <img src="/wealthyai/icons/generated.png" alt="WealthyAI Logo" className="main-logo" />
          </div>
          
          <div className="text-frame">
            <h1 className="main-title">AI-Powered Financial Thinking.</h1>
            <p className="main-subtitle">
              We didn't build WealthyAI to tell you what to do. We built it to answer a different question: 
              <strong> What happens if AI doesn't advise — but interprets?</strong>
            </p>
            
            <div className="status-row">
              <span className="tag">NOT ADVICE</span>
              <span className="sep">/</span>
              <span className="tag">NOT PREDICTIONS</span>
              <span className="sep">/</span>
              <span className="tag">PURE INTELLIGENCE</span>
            </div>
          </div>

          <div className="cta-box">
            <a href="/start" className="start-button">
              <span className="top">Launch Analysis</span>
              <span className="bottom">START FOR FREE</span>
            </a>
            <div className="security-note">
              <span className="green-dot"></span>
              Secure & Private: No Log-In Required
            </div>
          </div>
        </section>

        {/* --- FEATURES MINI-GRID --- */}
        {!isMobile && (
          <section className="mini-features">
            <div className="feat-card">
              <h3>Interpretation</h3>
              <p>Translating raw numbers into human logic.</p>
            </div>
            <div className="feat-card">
              <h3>Structure</h3>
              <p>Organizing chaos into actionable layers.</p>
            </div>
            <div className="feat-card">
              <h3>Clarity</h3>
              <p>Removing the noise from financial data.</p>
            </div>
          </section>
        )}
      </main>

      {/* --- FOOTER --- */}
      <footer className="footer-area">
        <div className="footer-top">
          <div className="footer-col">
            <a href="https://facebook.com/..." className="builder-btn">
              [ Help to Builders ]
            </a>
            <div className="ms-partner">
              <span>Member of</span>
              <img src="/wealthyai/icons/microsoft-logo-png-2395.png" alt="Microsoft" />
            </div>
          </div>

          <div className="footer-col right">
            <div className="footer-nav">
              <a href="/PrivacyPolicy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="mailto:info@mywealthyai.com">Support</a>
            </div>
            <div className="social-links">
              <a href="#" className="soc-icon"><img src="/wealthyai/icons/fb.png" alt="FB" /></a>
              <a href="#" className="soc-icon"><img src="/wealthyai/icons/x.png" alt="X" /></a>
              <a href="#" className="soc-icon"><img src="/wealthyai/icons/linkedin.png" alt="IN" /></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 mywealthyai.com — Financial Intelligence Platform</p>
        </div>
      </footer>

      {/* --- GLOBAL STYLES --- */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;700&display=swap');

        :root { --primary: #38bdf8; --bg: #020617; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body { 
          background: var(--bg); color: white; 
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        .site-wrapper { position: relative; min-height: 100vh; display: flex; flex-direction: column; }

        /* Header */
        .header {
          position: fixed; top: 0; width: 100%; z-index: 100;
          padding: 20px 40px; transition: 0.4s;
        }
        .header.active { background: rgba(2, 6, 23, 0.8); backdrop-filter: blur(15px); padding: 15px 40px; border-bottom: 1px solid rgba(56,189,248,0.1); }
        .header-inner { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
        
        .nav-group { display: flex; gap: 25px; }
        .nav-link { 
          color: rgba(255,255,255,0.6); text-decoration: none; font-size: 11px; 
          text-transform: uppercase; letter-spacing: 1.5px; transition: 0.3s;
        }
        .nav-link:hover { color: var(--primary); }
        .nav-link.border { border: 1px solid var(--primary); padding: 4px 12px; border-radius: 4px; }

        .clock-display { display: flex; gap: 30px; }

        /* Hero */
        .content-root { flex: 1; z-index: 5; display: flex; flex-direction: column; align-items: center; padding-top: 120px; }
        .hero-section { text-align: center; max-width: 900px; padding: 0 20px; }
        
        .logo-container { margin-bottom: 30px; }
        .main-logo { width: 100%; max-width: 700px; filter: drop-shadow(0 0 50px rgba(56,189,248,0.15)); animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }

        .main-title { font-size: 2.8rem; font-weight: 100; margin-bottom: 20px; letter-spacing: -1px; }
        .main-subtitle { font-size: 1.2rem; line-height: 1.7; opacity: 0.7; font-weight: 300; margin-bottom: 30px; }
        .main-subtitle strong { color: var(--primary); font-weight: 400; }

        .status-row { display: flex; justify-content: center; gap: 15px; margin-bottom: 50px; }
        .tag { font-size: 10px; letter-spacing: 2px; opacity: 0.4; }
        .sep { color: var(--primary); opacity: 0.5; }

        /* CTA */
        .cta-box { display: flex; flex-direction: column; align-items: center; gap: 15px; }
        .start-button {
          background: rgba(56,189,248,0.05); border: 1px solid var(--primary);
          padding: 18px 60px; border-radius: 20px; color: white; text-decoration: none;
          display: flex; flex-direction: column; transition: 0.4s;
          box-shadow: 0 0 30px rgba(56,189,248,0.1);
        }
        .start-button:hover { transform: scale(1.05); background: var(--primary); color: black; box-shadow: 0 0 50px rgba(56,189,248,0.4); }
        .start-button .top { font-size: 1.6rem; font-weight: 700; }
        .start-button .bottom { font-size: 9px; letter-spacing: 1px; opacity: 0.8; }

        .security-note { font-size: 11px; opacity: 0.5; display: flex; align-items: center; gap: 8px; }
        .green-dot { width: 7px; height: 7px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; }

        /* Features */
        .mini-features { display: flex; gap: 30px; margin-top: 80px; padding-bottom: 100px; }
        .feat-card { 
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
          padding: 25px; border-radius: 15px; width: 220px; backdrop-filter: blur(10px);
        }
        .feat-card h3 { font-size: 14px; color: var(--primary); margin-bottom: 10px; text-transform: uppercase; }
        .feat-card p { font-size: 12px; opacity: 0.6; line-height: 1.4; }

        /* Footer */
        .footer-area { background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 60px 40px 30px; margin-top: 50px; }
        .footer-top { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: flex-end; }
        .builder-btn { color: var(--primary); text-decoration: none; font-size: 11px; border: 1px solid rgba(56,189,248,0.3); padding: 5px 12px; border-radius: 5px; }
        .ms-partner { display: flex; align-items: center; gap: 10px; margin-top: 20px; font-size: 11px; opacity: 0.5; }
        .ms-partner img { height: 20px; }

        .footer-nav { display: flex; gap: 20px; margin-bottom: 20px; justify-content: flex-end; }
        .footer-nav a { color: white; opacity: 0.5; text-decoration: none; font-size: 12px; }
        .social-links { display: flex; gap: 15px; justify-content: flex-end; }
        .soc-icon img { width: 24px; opacity: 0.4; transition: 0.3s; }
        .soc-icon:hover img { opacity: 1; }

        .footer-bottom { text-align: center; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; font-size: 10px; opacity: 0.3; }

        /* Mobile */
        @media (max-width: 768px) {
          .header { padding: 15px 20px; }
          .clock-display { display: none; }
          .main-title { font-size: 1.8rem; }
          .footer-top { flex-direction: column; align-items: center; gap: 40px; text-align: center; }
          .footer-nav, .social-links { justify-content: center; }
        }
      `}</style>
    </div>
  );
}
