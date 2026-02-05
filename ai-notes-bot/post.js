import { chromium } from "playwright";
import fs from "fs";
import { CONFIG } from "./config.js";
import { NOTES_POOL } from "./notesPool.js";

const STATE = "./ai-notes-bot/state.json";

const loadState = () => JSON.parse(fs.readFileSync(STATE));
const saveState = s => fs.writeFileSync(STATE, JSON.stringify(s, null, 2));

const daysSince = d =>
  d ? (Date.now() - new Date(d)) / 86400000 : Infinity;

export async function postNote() {
  const state = loadState();
  if (daysSince(state.lastPostAt) < CONFIG.POST_INTERVAL_DAYS) return;

  const available = NOTES_POOL.filter(n => !state.used.includes(n));
  if (!available.length) return;

  const note = available[Math.floor(Math.random() * available.length)];

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(CONFIG.SUBSTACK.LOGIN_URL);
  await page.fill('input[type="email"]', process.env.SUBSTACK_EMAIL);
  await page.fill('input[type="password"]', process.env.SUBSTACK_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);

  await page.goto(CONFIG.SUBSTACK.PUBLICATION_URL + "/notes");
  await page.click('text=New note');
  await page.fill("textarea", note);
  await page.click('text=Post');

  await browser.close();

  state.used.push(note);
  state.lastPostAt = new Date().toISOString();
  saveState(state);
}
