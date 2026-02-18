import { useEffect } from "react";

export default function HunterAccess() {
  useEffect(() => {
    // 1. Beállítjuk a VIP tokent (Nem a Mastert!)
    localStorage.setItem("wai_vip_token", "HUNTER-ACCESS-2026");

    // 2. Beállítunk egy lejárati időt (8 óra = 28800000 milliszekundum)
    const expiryTime = new Date().getTime() + 28800000;
    localStorage.setItem("wai_vip_expiry", expiryTime);

    // 3. Azonnal átirányítjuk a Dashboardra
    window.location.href = "/premium-hub"; // Itt a te dashboardod elérési útja legyen
  }, []);

  return (
    <div style={{ backgroundColor: "#020617", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ color: "#fbbf24" }}>WAI VIP ACCESS GRANTED</h2>
        <p>Initializing Premium Intelligence Hub...</p>
        <div className="spinner"></div>
      </div>
    </div>
  );
}
