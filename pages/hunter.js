import { useEffect } from "react";

export default function HunterAccess() {
  useEffect(() => {
    // 1. Megadjuk neki a Master kódot, hogy a belső oldalak (Month, Day) NE dobják ki
    localStorage.setItem("wai_vip_token", "MASTER-DOMINANCE-2026");
    
    // 2. Elhelyezünk egy "GUEST" jelzőt, amit csak a Dashboard (hub.js) fog nézni
    localStorage.setItem("wai_role", "GUEST");

    setTimeout(() => {
      window.location.href = "/premium/hub"; 
    }, 1000);
  }, []);

  return (
    <div style={{ backgroundColor: "#020617", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", color: "white", textAlign: "center", fontFamily: "sans-serif" }}>
      <div>
        <h2 style={{ color: "#fbbf24" }}>WAI VIP ACCESS GRANTED</h2>
        <p>Initializing Premium Intelligence Hub...</p>
      </div>
    </div>
  );
}
