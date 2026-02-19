import { useEffect } from "react";

export default function HunterAccess() {
  useEffect(() => {
    // A "MASTER-DOMINANCE-2026" kód Base64 formátumban maszkolva
    // Így az F12 kereső nem talál rá a "MASTER" kulcsszóra.
    const secret = "TUFTVEVSLURPTUlOQU5DRS0yMDI2"; 
    
    try {
      // Dekódolás és elhelyezés a tárolóba
      localStorage.setItem("wai_vip_token", atob(secret));
      
      // GUEST szerepkör beállítása a korlátozott nézethez
      localStorage.setItem("wai_role", "GUEST");

      // Rövid késleltetés a drámai hatás és a stabil írás kedvéért
      setTimeout(() => {
        window.location.href = "/premium/hub"; 
      }, 1200);
    } catch (e) {
      console.error("Access error");
    }
  }, []);

  return (
    <div style={{ 
      backgroundColor: "#020617", 
      height: "100vh", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      color: "white", 
      textAlign: "center", 
      fontFamily: "Inter, sans-serif" 
    }}>
      <div style={{ animation: "fadeIn 1s ease-in" }}>
        <h2 style={{ color: "#fbbf24", letterSpacing: "2px", marginBottom: "10px" }}>
          WAI VIP ACCESS GRANTED
        </h2>
        <p style={{ opacity: 0.7, fontSize: "14px" }}>
          Initializing Premium Intelligence Hub...
        </p>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
