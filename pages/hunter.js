import { useEffect } from "react";

export default function HunterAccess() {
  useEffect(() => {
    // 1. Beállítjuk a VIP tokent a Hunternek
    localStorage.setItem("wai_vip_token", "HUNTER-ACCESS-2026");

    // 2. Beállítunk egy lejárati időt (8 óra)
    const expiryTime = new Date().getTime() + 28800000;
    localStorage.setItem("wai_vip_expiry", expiryTime);

    // 3. Átirányítás a HELYES útvonalra: /premium/hub
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
