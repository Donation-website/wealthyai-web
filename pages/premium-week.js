import Head from "next/head";
import { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ================= CONSTANTS ================= */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CATEGORIES = [
  "rent",
  "food",
  "transport",
  "entertainment",
  "subscriptions",
  "other",
];

const COLORS = {
  rent: "#38bdf8",
  food: "#22d3ee",
  transport: "#34d399",
  entertainment: "#a78bfa",
  subscriptions: "#f472b6",
  other: "#facc15",
};

/* ================= PAGE ================= */

export default function PremiumWeek() {
  const [income, setIncome] = useState(750);
  const [week, setWeek] = useState(
    DAYS.reduce(
      (acc, d) => ({
        ...acc,
        [d]: CATEGORIES.reduce((o, c) => ({ ...o, [c]: 0 }), {}),
      }),
      {}
    )
  );

  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  /* ===== CALCULATIONS ===== */

  const dailyTotals = DAYS.map((d) =>
    Object.values(week[d]).reduce((a, b) => a + b, 0)
  );

  const weeklySpend = dailyTotals.reduce((a, b) => a + b, 0);
  const savingsRate =
    income > 0 ? ((income - weeklySpend) / income) * 100 : 0;

  const chartData = DAYS.map((d, i) => ({
    day: d,
    total: dailyTotals[i],
    ...week[d],
  }));

  const pieData = CATEGORIES.map((c) => ({
    name: c,
    value: DAYS.reduce((s, d) => s + week[d][c], 0),
  }));

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        savingsRate * 2 -
          Math.max(...dailyTotals) / (weeklySpend + 1) * 40
      )
    )
  );

  /* ===== AI CALL ===== */

  const runAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: "US",
          weeklyIncome: income,
          weeklySpend,
          dailyTotals,
          breakdown: week,
        }),
      });
      const json = await res.json();
      setAiText(json.insight || "AI unavailable.");
    } catch {
      setAiText("AI system error.");
    }
    setLoading(false);
  };

  /* ================= RENDER ================= */

  return (
    <>
      <Head>
        <style>{`
          html, body {
            background: radial-gradient(circle at top, #020617, #000);
            color: white;
          }
        `}</style>
      </Head>

      <div className="min-h-screen px-10 py-12 text-white">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-neon">
            Weekly AI Command Center
          </h1>
          <p className="text-textdim mt-2">
            Behavioral analysis · Risk detection · Tactical optimization
          </p>
        </div>

        {/* KPI ROW */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <KPI title="Weekly Spend" value={`$${weeklySpend}`} />
          <KPI title="Savings Rate" value={`${savingsRate.toFixed(1)}%`} />
          <KPI title="Risk Level" value={savingsRate > 20 ? "Low" : "Medium"} />
          <KPI title="Financial Score" value={`${score} / 100`} />
        </div>

        {/* INPUT + CHARTS */}
        <div className="grid grid-cols-3 gap-6 mb-10">

          <Panel title="Cash Flow Over Time">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Area
                  dataKey="total"
                  stroke="#38bdf8"
                  fill="#38bdf8"
                  fillOpacity={0.25}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Spending Distribution">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={80}>
                  {pieData.map((p, i) => (
                    <Cell key={i} fill={COLORS[p.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Savings Velocity">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line
                  dataKey="total"
                  stroke="#a78bfa"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </div>

        {/* INPUT GRID */}
        <div className="grid grid-cols-7 gap-4 mb-10">
          {DAYS.map((d) => (
            <div key={d} className="bg-panel border border-slate-800 rounded-xl p-4">
              <div className="text-neon text-sm mb-2">{d}</div>
              {CATEGORIES.map((c) => (
                <input
                  key={c}
                  type="number"
                  placeholder={c}
                  className="w-full mb-2 bg-transparent border-b border-slate-700 text-neon outline-none"
                  value={week[d][c]}
                  onChange={(e) =>
                    setWeek({
                      ...week,
                      [d]: {
                        ...week[d],
                        [c]: Number(e.target.value),
                      },
                    })
                  }
                />
              ))}
            </div>
          ))}
        </div>

        {/* AI PANEL */}
        <div className="bg-panel border border-slate-800 rounded-xl p-6 shadow-glow">
          <button
            onClick={runAI}
            className="w-full py-3 mb-4 bg-neon text-black font-bold rounded-lg hover:opacity-90 transition"
          >
            {loading ? "Analyzing…" : "Regenerate AI Strategy"}
          </button>
          <pre className="text-sm whitespace-pre-wrap text-textdim">
            {aiText ||
              "AI will analyze your weekly behavior and provide strategic guidance."}
          </pre>
        </div>

      </div>
    </>
  );
}

/* ================= COMPONENTS ================= */

function Panel({ title, children }) {
  return (
    <div className="bg-panel border border-slate-800 rounded-xl p-4 shadow-glow">
      <div className="text-sm text-neon mb-2">{title}</div>
      {children}
    </div>
  );
}

function KPI({ title, value }) {
  return (
    <div className="bg-panel border border-slate-800 rounded-xl p-5 shadow-glow">
      <div className="text-xs text-textdim mb-1">{title}</div>
      <div className="text-2xl font-bold text-neon">{value}</div>
    </div>
  );
}
