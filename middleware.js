import { NextResponse } from "next/server";

/* ================================
   BOT PATTERN BLOCK
================================ */

const BOT_PATTERNS = [
  "bot",
  "crawler",
  "spider",
  "scraper",
  "curl",
  "python",
  "headless",
  "lighthouse"
];

/* ================================
   SIMPLE GLOBAL RATE LIMIT
   20 REQUEST / IP / 1 MINUTE
================================ */

const rateStore = global.rateStore || new Map();
global.rateStore = rateStore;

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 perc
  const limit = 20;

  if (!rateStore.has(ip)) {
    rateStore.set(ip, { count: 1, first: now });
    return true;
  }

  const data = rateStore.get(ip);

  if (now - data.first > windowMs) {
    rateStore.set(ip, { count: 1, first: now });
    return true;
  }

  if (data.count >= limit) {
    return false;
  }

  data.count++;
  return true;
}

/* ================================
   MIDDLEWARE
================================ */

export function middleware(req) {
  const ua = req.headers.get("user-agent")?.toLowerCase() || "";
  const ip =
    req.ip ||
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    "unknown";

  // 1️⃣ BOT BLOCK
  if (BOT_PATTERNS.some(p => ua.includes(p))) {
    return new NextResponse("Blocked", { status: 403 });
  }

  // 2️⃣ Empty / Suspicious UA
  if (!ua || ua.length < 10) {
    return new NextResponse("Blocked", { status: 403 });
  }

  // 3️⃣ IP RATE LIMIT
  if (!checkRateLimit(ip)) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
