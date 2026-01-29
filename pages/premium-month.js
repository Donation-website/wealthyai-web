import { useState, useEffect } from "react";

/* ===== REGION DETECTION (AUTHORITATIVE) ===== */
const detectRegion = () => {
  const saved = localStorage.getItem("detectedRegion");
  if (saved) return saved;

  const lang = navigator.language || "";
  const tz =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "";

  let region = "EU";

  if (lang.startsWith("hu") || tz.includes("Budapest")) {
    region = "HU";
  } else if (lang.startsWith("en-GB") || tz.includes("London")) {
    region = "UK";
  } else if (
    lang.startsWith("de") ||
    lang.startsWith("fr") ||
    lang.startsWith("es") ||
    lang.startsWith("it") ||
    lang.startsWith("nl")
  ) {
    region = "EU";
  } else {
    region = "OTHER";
  }

  localStorage.setItem("detectedRegion", region);
  return region;
};

/* ===== REGIONS ===== */
const REGIONS = [
  { code: "US", label: "United States" },
  { code: "EU", label: "European Union" },
  { code: "UK", label: "United Kingdom" },
  { code: "HU", label: "Hungary" },
  { code: "OTHER", label: "Other / Global" },
];

export default function PremiumMonth() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      window.location.href = "/start";
      return;
    }

    fetch("/api/verify-active-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(res => res.json())
      .then(d => {
        if (!d.valid) window.location.href = "/start";
      })
      .catch(() => {
        window.location.href = "/start";
      });
  }, []);

  const [region, setRegion] = useState(() => detectRegion());

  const [inputs, setInputs] = useState({
    income: 4000,
    housing: 1200,
    electricity: 120,
    gas: 90,
    water: 40,
    internet: 60,
    mobile: 40,
    tv: 30,
    insurance: 150,
    banking: 20,
    unexpected: 200,
    other: 300,
  });

  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [analysisMode] = useState("executive");
  const [aiCollapsed] = useState(false);

  const update = (k, v) =>
    setInputs({ ...inputs, [k]: Number(v) });

  const [cycleDay, setCycleDay] = useState(1);

  useEffect(() => {
    const stripeStart = localStorage.getItem("subscriptionPeriodStart");
    const localStart = localStorage.getItem("monthCycleStart");
    const start = stripeStart || localStart;

    if (!start) {
      const now = Date.now();
      localStorage.setItem("monthCycleStart", now.toString());
      setCycleDay(1);
    } else {
      const diffDays = Math.floor(
        (Date.now() - Number(start)) / (1000 * 60 * 60 * 24)
      );
      setCycleDay(Math.min(diffDays + 1, 30));
    }
  }, []);

  function saveBriefing(text) {
    const today = new Date().toISOString().slice(0, 10);
    const stored =
      JSON.parse(localStorage.getItem("monthlyBriefings")) || [];

    if (!stored.find(b => b.date === today)) {
      stored.push({ date: today, cycleDay, text });
      localStorage.setItem(
        "monthlyBriefings",
        JSON.stringify(stored.slice(-30))
      );
    }
  }
  const [exportRange, setExportRange] = useState("day");

  async function handleDownloadPDFServer() {
    const res = await fetch("/api/export-month-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "WealthyAI · Monthly Briefing",
        meta: `Region: ${region} · Day ${cycleDay}`,
        text: aiText,
      }),
    });

    if (!res.ok) return alert("PDF generation failed.");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wealthyai-monthly-briefing.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownload() {
    const blob = new Blob([aiText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wealthyai.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ padding: 40 }}>
      <button onClick={runAI}>
        {loading ? "Generating…" : "Generate Monthly Briefing"}
      </button>

      {aiOpen && !aiCollapsed && (
        <>
          <pre>{aiText}</pre>
          <button onClick={handleDownload}>TXT</button>
          <button onClick={handleDownloadPDFServer}>PDF</button>
        </>
      )}
    </div>
  );
}
