/* ===== STYLES ===== */

const page = {
  minHeight: "100vh",
  backgroundImage:
    "linear-gradient(rgba(2,6,23,0.85), rgba(0,0,0,0.9)), url('/wealthyai/icons/week.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  color: "#e5e7eb",
  padding: 40,
  fontFamily: "Inter, system-ui",
};

const glass = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 0 40px rgba(56,189,248,0.08)",
};

const nav = { display: "flex", gap: 16, marginBottom: 20 };

const navBtn = {
  border: "1px solid #38bdf8",
  color: "#38bdf8",
  padding: "8px 16px",
  borderRadius: 10,
  textDecoration: "none",
  fontSize: 13,
  background: "rgba(0,0,0,0.3)",
};

const navBtnAlt = {
  ...navBtn,
  borderColor: "#a78bfa",
  color: "#a78bfa",
};

const title = { fontSize: "2.6rem" };
const subtitle = { color: "#94a3b8", marginBottom: 30 };

const layout = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: 30,
};

const left = {
  maxHeight: "70vh",
  overflowY: "auto",
};

const right = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const card = {
  ...glass,
  borderRadius: 16,
  padding: 16,
  marginBottom: 20,
};

const dayBox = {
  ...glass,
  borderRadius: 16,
  padding: 14,
  marginBottom: 12,
};

const dayTitle = {
  cursor: "pointer",
  color: "#38bdf8",
  fontWeight: "bold",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 8,
};

const input = {
  background: "transparent",
  border: "none",
  borderBottom: "1px solid #38bdf8",
  color: "#38bdf8",
  width: 90,
  textAlign: "right",
};

const select = {
  background: "rgba(0,0,0,0.4)",
  color: "#38bdf8",
  border: "1px solid rgba(255,255,255,0.15)",
  padding: 8,
  borderRadius: 8,
};

const label = { color: "#7dd3fc", fontSize: 12 };
const hint = { fontSize: 11, color: "#94a3b8" };

const chartBox = {
  ...glass,
  borderRadius: 16,
  padding: 14,
};

const chartTitle = {
  fontSize: 12,
  color: "#7dd3fc",
  marginBottom: 6,
};

const summary = {
  gridColumn: "1 / -1",
  textAlign: "right",
  marginTop: 10,
};

const aiBox = {
  ...glass,
  gridColumn: "1 / -1",
  borderRadius: 16,
  padding: 16,
  marginTop: 10,
};

const aiButton = {
  width: "100%",
  padding: 14,
  background: "#38bdf8",
  border: "none",
  borderRadius: 12,
  fontWeight: "bold",
  cursor: "pointer",
};

const aiTextStyle = {
  marginTop: 10,
  whiteSpace: "pre-wrap",
  color: "#cbd5f5",
};
