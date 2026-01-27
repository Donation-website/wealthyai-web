import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PremiumRouter() {
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);

  // simple snapshot data (free B view)
  const data = [
    { name: "Income", value: 5000 },
    { name: "Expenses", value: 3500 },
    { name: "Surplus", value: 1500 },
  ];

  useEffect(() => {
    if (!router.isReady) return;

    const { session_id } = router.query;
    if (!session_id) return;

    setVerifying(true);

    const verify = async () => {
      try {
        const res = await fetch(`/api/verify-session?session_id=${session_id}`);
        const d = await res.json();

        if (!d.valid || !d.tier) return;

        localStorage.setItem(
          "premiumAccess",
          JSON.stringify({
            tier: d.tier,
            expiresAt: Date.now() + d.duration,
          })
        );

        if (d.tier === "day") router.replace("/day");
        if (d.tier === "week") router.replace("/premium-week");
        if (d.tier === "month") router.replace("/premium-month");
      } catch {}
    };

    verify();
  }, [router]);

  if (verifying) {
    return <div style={verify}>Verifying subscription…</div>;
  }

  return (
    <div style={page}>
      <h1 style={title}>Financial clarity starts with a snapshot</h1>

      {/* GRAPH */}
      <div style={card}>
        <div style={cardTitle}>Your financial snapshot</div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line dataKey="value" stroke="#38bdf8" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* INTERPRETATION */}
      <div style={text}>
        <p>This shows where you are right now.</p>
        <p>
          You’re not overspending — but surplus alone doesn’t mean progress.
        </p>
        <p>
          Numbers explain <strong>what</strong>. Patterns explain{" "}
          <strong>why</strong>.
        </p>
      </div>

      {/* PRIMARY CTA */}
      <div style={primary}>
        <a href="/start?plan=day" style={primaryBtn}>
          Start with 1-Day Clarity
        </a>
        <div style={hint}>
          Most users begin here to understand what’s really happening.
        </div>
      </div>

      {/* SECONDARY OPTIONS */}
      <div style={secondary}>
        <div style={secondaryTitle}>
          Already know what you’re looking for?
        </div>

        <div style={buttonRow}>
          <a href="/start?plan=week" style={secondaryBtn}>
            1-Week Behavior Analysis
          </a>
          <a href="/start?plan=month" style={secondaryBtn}>
            Monthly Direction & Strategy
          </a>
        </div>
      </div>
    </div>
  );
}

/* ===== STYLES ===== */

const verify = {
  minHeight: "100vh",
  background: "#020617",
  color: "#94a3b8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Inter, system-ui",
};

const page = {
  minHeight: "100vh",
  background: "#020617",
  color: "#e5e7eb",
  fontFamily: "Inter, system-ui",
  padding: 40,
};

const title = {
  fontSize: "2.4rem",
  textAlign: "center",
  marginBottom: 30,
};

const card = {
  border: "1px solid #1e293b",
  borderRadius: 14,
  padding: 16,
  marginBottom: 30,
};

const cardTitle = {
  fontSize: 13,
  color: "#7dd3fc",
  marginBottom: 8,
};

const text = {
  maxWidth: 600,
  margin: "0 auto 40px",
  lineHeight: 1.6,
  color: "#cbd5f5",
};

const primary = {
  textAlign: "center",
  marginBottom: 50,
};

const primaryBtn = {
  display: "inline-block",
  padding: "14px 28px",
  background: "#38bdf8",
  color: "#020617",
  borderRadius: 10,
  fontWeight: "bold",
  textDecoration: "none",
};

const hint = {
  marginTop: 10,
  fontSize: 13,
  color: "#94a3b8",
};

const secondary = {
  borderTop: "1px solid #1e293b",
  paddingTop: 30,
  textAlign: "center",
};

const secondaryTitle = {
  fontSize: 14,
  color: "#94a3b8",
  marginBottom: 16,
};

const buttonRow = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  flexWrap: "wrap",
};

const secondaryBtn = {
  padding: "12px 18px",
  border: "1px solid #1e293b",
  borderRadius: 10,
  textDecoration: "none",
  color: "#e5e7eb",
};
