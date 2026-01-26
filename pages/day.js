import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function DayPremium() {
  const [data, setData] = useState({
    income: 5000,
    fixed: 2000,
    variable: 1500,
  });
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("userFinancials");
    if (saved) setData(JSON.parse(saved));
  }, []);

  const surplus = data.income - (data.fixed + data.variable);
  const savingsRate =
    data.income > 0 ? (surplus / data.income) * 100 : 0;
  const fiveYearProjection = surplus * 60 * 1.45;

  const chartData = [
    { name: "Now", value: surplus },
    { name: "Y1", value: surplus * 12 * 1.08 },
    { name: "Y3", value: surplus * 36 * 1.25 },
    { name: "Y5", value: surplus * 60 * 1.45 },
  ];

  const askAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/get-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "day",            // ✅ CSAK EZ AZ ÚJ
          income: data.income,
          fixed: data.fixed,
          variable: data.variable,
        }),
      });
      const d = await res.json();
      setAiText(d.insight);
    } catch {
      setAiText("AI system temporarily unavailable.");
    }
    setLoading(false);
  };

  return (
    <div style={page}>
      <div style={header}>
        <h1 style={title}>WEALTHYAI · PRO INTELLIGENCE</h1>
        <p style={subtitle}>
          Thank you for choosing the <strong>1-Day Professional Access</strong>.
        </p>
      </div>

      <div style={layout}>
        <div>
          <Metric label="MONTHLY SURPLUS" value={`$${surplus.toLocaleString()}`} />
          <Metric label="SAVINGS RATE" value={`${savingsRate.toFixed(1)}%`} />
          <Metric
            label="5Y PROJECTION"
            value={`$${Math.round(fiveYearProjection).toLocaleString()}`}
          />

          <div style={aiBox}>
            <button onClick={askAI} style={aiButton}>
              {loading ? "ANALYZING…" : "GENERATE AI STRATEGY"}
            </button>
            <pre style={aiTextStyle}>{aiText}</pre>
          </div>
        </div>

        <div>
          <div style={inputPanel}>
            {["income", "fixed", "variable"].map((k) => (
              <div key={k} style={inputRow}>
                <span>{k.toUpperCase()}</span>
                <input
                  type="number"
                  value={data[k]}
                  onChange={(e) =>
                    setData({ ...data, [k]: Number(e.target.value) })
                  }
                  style={input}
                />
              </div>
            ))}
          </div>

          <div style={chartGrid}>
            <MiniChart title="Cash Flow Projection" data={chartData} />
            <MiniBar title="Expense Distribution" value={data.fixed + data.variable} />
          </div>
        </div>
      </div>

      <div style={upsell}>
        Weekly and Monthly plans unlock country-specific tax optimization,
        stress testing and advanced projections.
      </div>
    </div>
  );
}

/* ===== A STÍLUSOK ÉS KOMPONENSEK
   👉 VÁLTOZATLANOK
   👉 A HÁTTÉR EZÉRT NEM TŰNIK EL
*/
