export default function HowItWorks() {
  return (
    <main style={pageStyle("/wealthyai/dia.png")}>
      <div style={contentBox}>
        <h1>How WealthyAI Works</h1>

        <p>
          WealthyAI helps you understand your financial situation using
          structured, AI-assisted insights.
        </p>

        <ul>
          <li>Clear financial overviews</li>
          <li>Visual explanations</li>
          <li>Long-term thinking support</li>
        </ul>

        <p>
          WealthyAI does not provide legal or investment advice.
        </p>
      </div>
    </main>
  );
}

const pageStyle = (img) => ({
  minHeight: "100vh",
  backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${img}')`,
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
