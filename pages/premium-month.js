"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";

/* ===== REGION DETECTION (CLIENT SAFE) ===== */
const detectRegion = () => {
  if (typeof window === "undefined") return "EU";

  const saved = localStorage.getItem("detectedRegion");
  if (saved) return saved;

  const lang = navigator.language || "";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

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
  /* ===== SUBSCRIPTION CHECK ===== */
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

  /* ===== SAFE REGION INIT ===== */
  const [region, setRegion] = useState("EU");

  useEffect(() => {
    setRegion(detectRegion());
  }, []);

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
  const [analysisMode, setAnalysisMode] = useState("executive");
  const [aiCollapsed, setAiCollapsed] = useState(false);
  const [cycleDay, setCycleDay] = useState(1);
  const [exportRange, setExportRange] = useState("day");

  const update = (k, v) =>
    setInputs({ ...inputs, [k]: Number(v) });

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

    const entry = {
      id: Date.now(),
      date: today,
      cycleDay,
      analysisMode,
      text,
    };

    const stored =
      JSON.parse(localStorage.getItem("monthlyBriefings")) || [];

    const exists = stored.find(
      b => b.date === today && b.analysisMode === analysisMode
    );

    if (!exists) {
      stored.push(entry);
      localStorage.setItem(
        "monthlyBriefings",
        JSON.stringify(stored.slice(-30))
      );
    }
  }

  function getBriefings(range) {
    const stored =
      JSON.parse(localStorage.getItem("monthlyBriefings")) || [];

    if (range === "day") {
      const today = new Date().toISOString().slice(0, 10);
      return stored.filter(b => b.date === today);
    }

    if (range === "week") return stored.slice(-7);
    if (range === "month") return stored;

    return [];
  }

  const runAI = async () => {
    setLoading(true);
    setAiOpen(true);
    setAiCollapsed(false);

    try {
      const res = await fetch("/api/get-ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          cycleDay,
          analysisMode,
          ...inputs,
        }),
      });

      const data = await res.json();
      const text = data.briefing || "AI briefing unavailable.";
      setAiText(text);
      saveBriefing(text);
    } catch {
      setAiText("AI system temporarily unavailable.");
    }

    setLoading(false);
  };

  /* ===== UI RENDER ===== */
  return (
    <div>
      <h1>WEALTHYAI · MONTHLY BRIEFING</h1>

      <select value={region} onChange={e => setRegion(e.target.value)}>
        {REGIONS.map(r => (
          <option key={r.code} value={r.code}>{r.label}</option>
        ))}
      </select>

      <button onClick={runAI}>
        {loading ? "Generating…" : "Generate Briefing"}
      </button>

      {aiOpen && <pre>{aiText}</pre>}
    </div>
  );
}
