import fs from "fs";
import path from "path";
import { notesPool } from "./notesPool.js";

const base = path.resolve("./ai-notes-bot");
const outputPath = path.join(base, "current_note.txt");

const available = notesPool.candidates.filter(
  note => !notesPool.used.includes(note)
);

if (available.length === 0) {
  console.log("No unused notes left.");
  process.exit(0);
}

const note = available[Math.floor(Math.random() * available.length)];
notesPool.used.push(note);

// opcionális: menthetjük vissza fájlba később
fs.writeFileSync(outputPath, note);

console.log("Note prepared:");
console.log(note);
