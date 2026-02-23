import React, { useState, useEffect } from "react";
import Head from "next/head";
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";

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
      if (!response.ok) throw new Error("Hiba az adatok letöltésekor");
      const data = await response.json();
      setMarkets(data);
      
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      setError("System temporary offline. Reconnecting...");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Első betöltéskor lefut
  useEffect(() => {
    fetchMarketData();
    // 60 másodpercenként automatikusan frissít
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
          <div className="brand-badge">WealthyAI Intelligence</div>
          <h1 className="title">Market Snapshot</h1>
          <p className="subtitle">Real-time global market pulse via Yahoo Finance.</p>
        </div>

        {error && (
          <div className="error-msg">{error}</div>
        )}

        <div className="market-grid">
          {loading && markets.length === 0 ? (
            // Skeleton loading (opcionális, most csak egy üres állapot)
            [1, 2, 3, 4].map(i => <div key={i} className="market-card loading-shimmer" />)
          ) : (
            markets.map((item) => (
              <div key={item.symbol} className="market-card">
                <div className="card-top">
                  <span className="ticker">{item.symbol}</span>
                  {item.up ? <ArrowUpRight className="icon up" /> : <ArrowDownRight className="icon down" />}
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
                <div className="card-chart-placeholder">
                   <div className={`mini-line ${item.up ? "bg-up" : "bg-down"}`} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="status-bar">
          <div className="status-info">
            <span className="pulse-dot" />
            {loading ? "Synchronizing with Yahoo Finance..." : `Live Market Data • Last updated: ${lastUpdated}`}
          </div>
          <button 
            onClick={fetchMarketData} 
            className={`refresh-btn ${loading ? "spinning" : ""}`}
            disabled={loading}
          >
            <RefreshCw size={18} />
            <span>{loading ? "Updating..." : "Refresh"}</span>
          </button>
        </div>

        <a href="/" className="back-link">Return to Terminal</a>
      </main>

      <style jsx>{`
        .market-container { min-height: 100vh; width: 100%; color: white; font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; position: relative; }
        .fixed-bg { position: fixed; inset: 0; background-color: #060b13; background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/wealthyai/wealthyai.png'); background-size: cover; background-position: center; z-index: -1; }
        .content { width: 100%; max-width: 1200px; padding: 40px 20px; z-index: 1; }
        .header-section { text-align: center; margin-bottom: 60px; }
        .brand-badge { display: inline-block; padding: 6px 14px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 20px; color: #38bdf8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; }
        .title { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; margin: 0; letter-spacing: -1px; background: linear-gradient(to bottom, #fff 0%, #94a3b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtitle { color: rgba(255,255,255,0.6); font-size: 1.1rem; margin-top: 10px; }
        .error-msg { text-align: center; color: #ef4444; margin-bottom: 20px; font-weight: 600; }
        .market-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .market-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 24px; transition: all 0.3s ease; position: relative; overflow: hidden; height: 180px; }
        .market-card:hover { transform: translateY(-5px); background: rgba(255, 255, 255, 0.06); border-color: rgba(56, 189, 248, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .ticker { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.4); }
        .icon.up { color: #10b981; }
        .icon.down { color: #ef4444; }
        .card-info h3 { margin: 0; font-size: 1.4rem; font-weight: 600; }
        .price-row { display: flex; align-items: baseline; gap: 10px; margin-top: 5px; }
        .price { font-size: 1.8rem; font-weight: 700; }
        .text-up { color: #10b981; }
        .text-down { color: #ef4444; }
        .bg-up { background: #10b981; box-shadow: 0 0 10px #10b981; }
        .bg-down { background: #ef4444; box-shadow: 0 0 10px #ef4444; }
        .mini-line { width: 100%; height: 2px; opacity: 0.3; border-radius: 2px; margin-top: 20px; }
        .status-bar { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 15px 25px; border-radius: 50px; border: 1px solid rgba(255,255,255,0.05); }
        .status-info { display: flex; align-items: center; gap: 12px; font-size: 0.85rem; color: rgba(255,255,255,0.5); }
        .pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        .refresh-btn { background: transparent; border: none; color: #38bdf8; display: flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer; }
        .refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .back-link { display: block; text-align: center; margin-top: 40px; color: rgba(255,255,255,0.4); text-decoration: none; font-size: 0.9rem; }
        .loading-shimmer { background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  );
}
