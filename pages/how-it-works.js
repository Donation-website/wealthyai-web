export default function HowItWorks() {
  return (
    <main style={pageStyle("/wealthyai/dia.png")}>
      <div style={contentBox}>
        <h1>How WealthyAI Works</h1>

        <p>
          WealthyAI is a digital financial planning platform designed to help
          individuals better understand their financial situation and make
          more informed decisions.
        </p>

        <p>
          By structuring your financial inputs and presenting them in a clear,
          logical way, WealthyAI assists you in identifying patterns, risks,
          and opportunities within your personal finances.
        </p>

        <p>
          The platform focuses on clarity, education, and long-term thinking.
          It does not replace professional financial advisors, but it helps
          you prepare better questions and gain confidence in your decisions.
        </p>

        <h2>Visual Understanding</h2>
        <p>
          Where applicable, WealthyAI provides visual representations such as
          charts and summaries to help you better understand financial trends
          and proportions.
        </p>

        <h2>Security & Responsibility</h2>
        <p>
          WealthyAI does not store sensitive financial data. All interactions
          are handled securely, and users remain fully responsible for how
          they apply the information provided.
        </p>

        <p>
          WealthyAI is an informational tool only and does not provide
          investment, legal, or tax advice.
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
