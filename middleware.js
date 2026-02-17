import { NextResponse } from "next/server";

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

export function middleware(req) {
  const ua = req.headers.get("user-agent")?.toLowerCase() || "";
  const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";

  // BOT BLOCK
  if (BOT_PATTERNS.some(p => ua.includes(p))) {
    return new NextResponse("Blocked", { status: 403 });
  }

  // Block suspicious empty UA
  if (!ua || ua.length < 10) {
    return new NextResponse("Blocked", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
