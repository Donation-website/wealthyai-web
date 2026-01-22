export default function Terms() {
  return (
    <main style={pageStyle("/wealthyai/icons/szgep.png")}>
      <div style={contentBox}>
        <h1>Terms & Conditions</h1>

        <p>
          WealthyAI is an informational platform designed to support financial
          awareness and planning.
        </p>

        <h2>Payments & Security</h2>
        <p>
          All payments are securely processed via Stripe. WealthyAI does not
          store credit card information or sensitive payment data.
        </p>

        <p>
          Stripe complies with industry-leading security standards to ensure
          safe and encrypted transactions.
        </p>

        <h2>User Responsibility</h2>
        <p>
          Users are fully responsible for how they interpret and apply the
          information provided by WealthyAI.
        </p>

        <p>
          By using this platform, you agree to these terms.
        </p>
      </div>
    </main>
  );
}

const pageStyle = (img) => ({
  minHeight: "100vh",
  backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${img}')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  color: "white",
  fontFamily: "Arial, sans-serif",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  paddingTop: "80px"
});

const contentBox = {
  maxWidth: "900px",
  background: "rgba(0,0,0,0.35)",
  padding: "40px",
  borderRadius: "14px",
  backdropFilter: "blur(8px)",
  lineHeight: "1.7"
};
