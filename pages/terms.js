export default function Terms() {
  return (
    <main style={pageStyle("/wealthyai/szgep.png")}>
      <div style={contentBox}>
        <h1>Terms & Conditions</h1>

        <p>
          WealthyAI is a digital informational platform. By using this website,
          you acknowledge that all content is provided for educational and
          informational purposes only.
        </p>

        <h2>Payments & Subscriptions</h2>
        <p>
          Payments on WealthyAI are processed securely through Stripe, a
          globally recognized payment provider. WealthyAI does not store
          credit card details or sensitive payment information.
        </p>

        <p>
          All transactions are encrypted and handled directly by Stripe in
          compliance with industry security standards.
        </p>

        <h2>User Responsibility</h2>
        <p>
          Users are solely responsible for how they interpret and apply the
          information provided by WealthyAI. The platform does not guarantee
          financial outcomes or results.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          WealthyAI shall not be held liable for any financial decisions made
          based on the information presented on this website.
        </p>

        <p>
          By continuing to use this platform, you agree to these terms.
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
