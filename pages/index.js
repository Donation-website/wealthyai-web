export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        color: "white",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem" }}>WealthyAI</h1>
        <p style={{ opacity: 0.7 }}>
          Professional financial planning – coming soon.
        </p>
      </div>
    </main>
  );
}
