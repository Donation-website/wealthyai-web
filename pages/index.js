export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/wealthyai/wealthyai.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: "white",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>WealthyAI</h1>
        <p style={{ opacity: 0.9, fontSize: "1.2rem" }}>
          Professional financial planning – coming soon.
        </p>
      </div>

      <div style={{ 
        display: "flex", 
        gap: "20px", 
        paddingBottom: "40px" 
      }}>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <img src="/wealthyai/icons/fb.png" alt="Facebook" style={{ width: "32px", height: "32px" }} />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <img src="/wealthyai/icons/insta.png" alt="Instagram" style={{ width: "32px", height: "32px" }} />
        </a>
        <a href="https://x.com" target="_blank" rel="noopener noreferrer">
          <img src="/wealthyai/icons/x.png" alt="X" style={{ width: "32px", height: "32px" }} />
        </a>
      </div>
    </main>
  );
}
