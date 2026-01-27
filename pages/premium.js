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
  const [verifying, setVerifying] = useState(true);

  // 🔹 demo / free snapshot data (B oldalhoz)
  const snapshotData = [
    { name: "Income", value: 5000 },
    { name: "Expenses", value: 3500 },
    { name: "Surplus", value: 1500 },
  ];

  useEffect(() => {
    if (!router.isReady) return;

    const { session_id } = router.query;
    if (!session_id) {
      setVerifying(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `/api/verify-session?session_id=${session_id}`
        );
        const data = await res.json();

        if (!data.valid || !data.tier) {
          setVerifying(false);
          return;
        }

        localStorage.setItem(
          "premiumAccess",
          JSON.stringify({
            tier: data.tier,
            expiresAt: Date.now() + data.duration,
          })
        );

        if (data.tier === "day") router.replace("/day");
        if (data.tier === "week") router.replace("/premium-week");
        if (data.tier === "month") router.replace("/premium-month");
      } catch {
        setVerifying(false);
      }
    };

    verify();
  }, [router]);

  // 🔹 AMÍG VERIFIKÁL → a régi viselkedés
  if (verifying) {
    return (
      <div style={verifyScreen}>
        Verifying subscription…
      </div>
    );
  }

  // 🔹 B OLDAL – FREE / ORIENTATION VIEW
  return (
    <div style={page}>
      <div style={header}>
        <h1 style={title}>WEALTHYAI · ORIENTATION</h1>
        <p style={subtitle}>
          This is not advice.  
          This is a snapshot.
        </p>
      </div>

      {/* SNAPSHOT VISUAL */}
      <div style={chartBox}>
        <div style={chartTitle}>Financial snapshot</div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={snapshotData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#38bdf8"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* INTERPRETATION LAYER */}
      <div style={insightBox}>
        <p>
          This snapshot shows where you are right now.  
          It does not show where this leads.
        </p>

        <p>
          You’re not overspending —  
          but surplus alone doesn’t mean progress.
        </p>

        <p>
          Numbers explain <strong>what</strong>.  
          Patterns explain <strong>why</strong>.
        </p>
      </div>

      {/* ACCESS LEVEL EXPLANATION */}
      <div style={accessBox}>
        <h3>What you’re seeing now</h3>
        <p>
          Orientation access shows context — not analysis.  
          Enough to understand what exists.  
          Not enough to see direction.
        </p>
      </div>

      {/* UPGRADE PATH */}
      <div style={upgradeBox}>
        <p>
          One day adds clarity.  
          One week reveals behavior.  
        </p>
        <p>
          Longer access turns patterns into direction —  
          inside your own financial system.
        </p>

        <a href="/start" style={cta}>
          Start with 1-Day Clarity
        </a>

        <div style={finePrint}>
          Weekly and monthly access unlock deeper,
          region-aware intelligence.
        </div>
      </div>
    </div>
  );
}

/* ===== STYLES ===== */

const verifyScreen = {
  minHeight: "100vh",
  background: "#020617",
  color: "#94a3b8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Inter, system-ui, sans-serif",
};

const page = {
  minHeight: "100vh",
  background: "#020617",
  color: "#e5e7eb",
  fontFamily: "Inter, system-ui, sans-serif",
  padding: 40,
};

const header = {
  textAlign: "center",
  marginBottom: 30,
};

const title = {
  fontSize: "2.4rem",
  margin: 0,
};

const subtitle = {
  marginTop: 10,
  color: "#94a3b8",
};

const chartBox = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 14,
  padding: 16,
  marginBottom: 30,
};

const chartTitle = {
  fontSize: 13,
  color: "#7dd3fc",
  marginBottom: 8,
};

const insightBox = {
  maxWidth: 600,
  margin: "0 auto 30px",
  color: "#cbd5f5",
  lineHeight: 1.6,
};

const accessBox = {
  maxWidth: 600,
  margin: "0 auto 30px",
  padding: 16,
  border: "1px solid #1e293b",
  borderRadius: 14,
};

const upgradeBox = {
  maxWidth: 600,
  margin: "0 auto",
  textAlign: "center",
};

const cta = {
  display: "inline-block",
  marginTop: 16,
  padding: "14px 26px",
  background: "#38bdf8",
  color: "#020617",
  fontWeight: "bold",
  borderRadius: 10,
  textDecoration: "none",
};

const finePrint = {
  marginTop: 12,
  fontSize: 13,
  color: "#94a3b8",
};
