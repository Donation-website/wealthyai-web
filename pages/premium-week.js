import { useState } from "react";
import {
  LineChart, Line,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts";

/* ================= DATA ================= */

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const CATEGORIES = ["rent","food","transport","entertainment","subscriptions","other"];

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
  const [income] = useState(750);
  const [week, setWeek] = useState(
    DAYS.reduce((a,d)=>({
      ...a,
      [d]: CATEGORIES.reduce((o,c)=>({...o,[c]:0}),{})
    }),{})
  );

  const [ai, setAI] = useState("");
  const [loading, setLoading] = useState(false);

  const dailyTotals = DAYS.map(d =>
    Object.values(week[d]).reduce((a,b)=>a+b,0)
  );

  const weeklySpend = dailyTotals.reduce((a,b)=>a+b,0);
  const savingsRate = income ? ((income-weeklySpend)/income)*100 : 0;

  const chartData = DAYS.map((d,i)=>({
    day:d,
    total: dailyTotals[i],
    ...week[d],
  }));

  const pieData = CATEGORIES.map(c=>({
    name:c,
    value:DAYS.reduce((s,d)=>s+week[d][c],0),
  }));

  const runAI = async () => {
    setLoading(true);
    const res = await fetch("/api/get-ai-insight",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        country:"US",
        weeklyIncome:income,
        weeklySpend,
        dailyTotals,
        breakdown:week,
      }),
    });
    const json = await res.json();
    setAI(json.insight);
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-10 text-white">
      
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-neon">Weekly AI Command Center</h1>
        <p className="text-textdim mt-2">
          Behavioral analysis · Risk detection · Tactical optimization
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <KPI title="Weekly Spend" value={`$${weeklySpend}`} />
        <KPI title="Savings Rate" value={`${savingsRate.toFixed(1)}%`} />
        <KPI title="Risk Level" value={savingsRate > 20 ? "Low" : "Medium"} />
        <KPI title="Profile" value="Weekend Optimizer" />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-3 gap-6">

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
                {pieData.map((p,i)=>(
                  <Cell key={i} fill={COLORS[p.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Savings Velocity Index">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#a78bfa"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Opportunity Cost Projection" className="col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line
                dataKey="total"
                stroke="#38bdf8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="AI Tactical Advice">
          <button
            onClick={runAI}
            className="w-full mb-3 py-3 rounded-lg bg-neon text-black font-bold hover:opacity-90 transition"
          >
            {loading ? "Analyzing…" : "Regenerate AI Strategy"}
          </button>
          <pre className="text-sm whitespace-pre-wrap text-textdim">
            {ai || "AI will generate a personalized strategy based on your behavior."}
          </pre>
        </Panel>

      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Panel({ title, children, className="" }) {
  return (
    <div className={`bg-panel backdrop-blur border border-slate-800 rounded-xl p-4 shadow-glow ${className}`}>
      <h3 className="text-sm text-neon mb-2">{title}</h3>
      {children}
    </div>
  );
}

function KPI({ title, value }) {
  return (
    <div className="bg-panel backdrop-blur border border-slate-800 rounded-xl p-5 shadow-glow">
      <div className="text-xs text-textdim mb-1">{title}</div>
      <div className="text-2xl font-bold text-neon">{value}</div>
    </div>
  );
}
