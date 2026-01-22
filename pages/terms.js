export default function Terms() {
  return (
    <main style={pageStyle("/wealthyai/szgep.png")}>
      <div style={contentBox}>
        <h1>Terms & Conditions</h1>

        <p>
          WealthyAI provides informational content only.
          No financial advice is given.
        </p>

        <p>
          Payments are securely processed via Stripe.
        </p>

        <p>
          By using this website, you accept these terms.
        </p>
      </div>
    </main>
  );
}

const pageStyle = (img) => ({
  minHeight: "100vh",
  backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('${img}')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  color: "white",
  fontFamily: "Arial, sans-serif",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
});

const contentBox = {
  maxWidth: "700px",
  background: "rgba(0,0,0,0.45)",
  padding: "40px",
  borderRadius: "14px",
  backdropFilter: "blur(8px)"
};
