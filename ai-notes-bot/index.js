import fs from "fs";
import { CONFIG } from "./config.js";
import { NOTES_POOL } from "./notesPool.js";

const STATE_PATH = "./ai-notes-bot/state.json";

function loadState() {
  return JSON.parse(fs.readFileSync(STATE_PATH, "utf-8"));
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function daysSince(date) {
  if (!date) return Infinity;
  return (Date.now() - new Date(date)) / (1000 * 60 * 60 * 24);
}

function pickNextNote(state) {
  const available = NOTES_POOL.filter(
    n => !state.usedNotes.includes(n)
  );
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// --- MAIN (DRY RUN) ---
const state = loadState();

if (daysSince(state.lastPostAt) < CONFIG.POST_INTERVAL_DAYS) {
  console.log("⏳ Not time yet.");
  process.exit(0);
}

const note = pickNextNote(state);

if (!note) {
  console.log("⚠️ No unused notes left.");
  process.exit(0);
}

console.log("✅ Next AI note prepared:\n");
console.log(note);

// ❗ FONTOS: ITT MÉG NINCS POSZTOLÁS
