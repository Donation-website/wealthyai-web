export default function Home() {
  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/wealthyai/wealthyai.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: "white",
        fontFamily: "Arial, sans-serif",
        position: "relative", // Ez kell ahhoz, hogy az ikonokat a sarokhoz rögzíthessük
        overflow: "hidden"
      }}
    >
      {/* Középső szöveg marad középen */}
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <h1 style={{ fontSize: "3.5rem", marginBottom: "0.5rem", fontWeight: "bold" }}>WealthyAI</h1>
        <p style={{ opacity: 0.9, fontSize: "1.2rem", letterSpacing: "1px" }}>
          Professional financial planning – coming soon.
        </p>
      </div>

      {/* Ikonok a bal alsó sarokban */}
      <div style={{ 
        position: "absolute",
        bottom: "30px", // 30 pixelre az aljától
        left: "30px",   // 30 pixelre a bal szélétől
        display: "flex", 
        gap: "15px",
        zIndex: 2
      }}>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ transition: "transform 0.2s" }}>
          <img src="/wealthyai/icons/fb.png" alt="Facebook" style={{ width: "28px", height: "28px", filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))" }} />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ transition: "transform 0.2s" }}>
          <img src="/wealthyai/icons/insta.png" alt="Instagram" style={{ width: "28px", height: "28px", filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))" }} />
        </a>
        <a href="https://x.com" target="_blank" rel="noopener noreferrer" style={{ transition: "transform 0.2s" }}>
          <img src="/wealthyai/icons/x.png" alt="X" style={{ width: "28px", height: "28px", filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))" }} />
        </a>
      </div>
    </main>
  );
}
