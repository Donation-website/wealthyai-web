import React, { useState, useEffect } from "react";
import Head from "next/head";

/* ===== CUSTOM SVG ICONS (No installation needed) ===== */
const ArrowUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7 7 10 10M17 7V17H7"/></svg>
);
const ArrowDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7 17 10-10M7 7H17V17"/></svg>
);
const RefreshIcon = ({ className }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
);

export default function MarketSnapshot() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [error, setError] = useState(null);

  const fetchMarketData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/market-data");
      if (!response.ok) throw new Error("Offline");
      const data = await response.json();
      setMarkets(data);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      setError("Market data temporarily unavailable.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="market-container">
      <Head>
        <title>Market Snapshot | WealthyAI</title>
      </Head>

      <div className="fixed-bg" />

      <main className="content">
        <div className="header-section">
          <div className="brand-badge">WealthyAI Financial Intelligence</div>
          <h1 className="title">Market Snapshot</h1>
          <p className="subtitle">Global asset performance via Yahoo Finance</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="market-grid">
          {loading && markets.length === 0 ? (
            [1, 2, 3, 4, 5].map(i => <div key={i} className="market-card loading-shimmer" />)
          ) : (
            markets.map((item) => (
              <div key={item.symbol} className="market-card">
                <div className="card-top">
                  <span className="ticker">{item.symbol}</span>
                  <span className={item.up ? "icon up" : "icon down"}>
                    {item.up ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  </span>
                </div>
                <div className="card-info">
                  <h3>{item.name}</h3>
                  <div className="price-row">
                    <span className="price">${item.price}</span>
                    <span className={`change ${item.up ? "text-up" : "text-down"}`}>
                      {item.change}
                    </span>
                  </div>
                </div>
                <div className="card-footer-line">
                  <div className={`mini-glow ${item.up ? "bg-up" : "bg-down"}`} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="status-bar">
          <div className="status-info">
            <span className="pulse-dot" />
            {loading ? "Re-syncing..." : `Live Feed • ${lastUpdated}`}
          </div>
          <button onClick={fetchMarketData} className="refresh-btn" disabled={loading}>
            <RefreshIcon className={loading ? "spinning" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        <a href="/" className="back-link">← Return to Terminal</a>
      </main>

      <style jsx>{`
        .market-container { min-height: 100vh; width: 100%; color: white; font-family: 'Inter', -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; position: relative; overflow: hidden; }
        .fixed-bg { position: fixed; inset: 0; background-color: #060b13; background-image: linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/wealthyai/wealthyai.png'); background-size: cover; background-position: center; z-index: -1; }
        .content { width: 100%; max-width: 1100px; padding: 40px 20px; z-index: 1; }
        .header-section { text-align: center; margin-bottom: 50px; }
        .brand-badge { display: inline-block; padding: 5px 15px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 20px; color: #38bdf8; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; }
        .title { font-size: clamp(2.5rem, 6vw, 3.5rem); font-weight: 800; margin: 0; background: linear-gradient(to bottom, #fff 30%, #64748b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtitle { color: rgba(255,255,255,0.5); font-size: 1rem; margin-top: 5px; }
        .market-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .market-card { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 18px; padding: 25px; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; }
        .market-card:hover { transform: translateY(-8px); background: rgba(255, 255, 255, 0.05); border-color: #38bdf866; box-shadow: 0 15px 30px rgba(0,0,0,0.4); }
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .ticker { font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.3); letter-spacing: 1px; }
        .icon.up { color: #10b981; filter: drop-shadow(0 0 5px #10b98144); }
        .icon.down { color: #ef4444; filter: drop-shadow(0 0 5px #ef444444); }
        .card-info h3 { margin: 0; font-size: 1.3rem; font-weight: 600; letter-spacing: -0.5px; }
        .price-row { display: flex; align-items: baseline; gap: 10px; margin-top: 8px; }
        .price { font-size: 1.7rem; font-weight: 700; font-family: monospace; }
        .change { font-size: 0.9rem; font-weight: 600; }
        .text-up { color: #10b981; }
        .text-down { color: #ef4444; }
        .card-footer-line { width: 100%; height: 1px; background: rgba(255,255,255,0.05); margin-top: 20px; position: relative; }
        .mini-glow { position: absolute; top: 0; left: 0; width: 40%; height: 1px; }
        .bg-up { background: #10b981; box-shadow: 0 0 10px #10b981; }
        .bg-down { background: #ef4444; box-shadow: 0 0 10px #ef4444; }
        .status-bar { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); padding: 14px 28px; border-radius: 50px; border: 1px solid rgba(255,255,255,0.05); }
        .status-info { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; color: rgba(255,255,255,0.4); font-weight: 500; }
        .pulse-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
        .refresh-btn { background: none; border: none; color: #38bdf8; display: flex; align-items: center; gap: 8px; font-weight: 700; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
        .refresh-btn:hover { opacity: 0.8; }
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .back-link { display: block; text-align: center; margin-top: 40px; color: rgba(255,255,255,0.3); text-decoration: none; font-size: 0.85rem; transition: color 0.3s; }
        .back-link:hover { color: #38bdf8; }
        .loading-shimmer { height: 180px; background: rgba(255,255,255,0.02); overflow: hidden; position: relative; }
        .loading-shimmer::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent); animation: shimmer 1.5s infinite; transform: translateX(-100%); }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .error-msg { text-align: center; color: #ef4444; margin-bottom: 20px; font-size: 0.9rem; }
      `}</style>
    </div>
  );
}
