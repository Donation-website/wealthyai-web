export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Itt az új háttérkép beállítása:
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/wealthyai/wealthyai.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: "white",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>WealthyAI</h1>
        <p style={{ opacity: 0.9, fontSize: "1.2rem" }}>
          Professional financial planning – coming soon.
        </p>
      </div>
    </main>
  );
}
