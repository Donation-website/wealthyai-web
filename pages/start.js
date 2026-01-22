export default function StartPage() {
    return (
        <main style={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#060b13", // Sötét háttér
            color: "white",
            fontFamily: "Arial, sans-serif",
            textAlign: "center"
        }}>
            <div style={{ 
                padding: "40px", 
                background: "rgba(255, 255, 255, 0.1)", 
                borderRadius: "15px", 
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)"
            }}>
                <h1 style={{fontSize: "2.5rem", marginBottom: "10px"}}>Coming Soon</h1>
                <p style={{fontSize: "1.1rem"}}>We are working hard to bring you the full WealthyAI experience.</p>
                
                {/* Back to Home link */}
                <div style={{ marginTop: "30px", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "20px" }}>
                    <a href="/" style={{ color: "white", textDecoration: "underline", opacity: 0.8, fontSize: "0.9rem" }}>
                        ← Back to Home
                    </a>
                </div>
            </div>
        </main>
    );
}
