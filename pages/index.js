import Head from "next/head";
import React from "react";

export default function Home() {
  const siteUrl = "https://wealthyai-web.vercel.app";

  return (
    <>
      <Head>
        <title>WealthyAI – AI-powered financial clarity</title>

        {/* BASIC SEO */}
        <meta
          name="description"
          content="AI-powered financial planning. Structured insights. Clear perspective. You decide."
        />

        {/* OPEN GRAPH (Facebook, LinkedIn) */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content="WealthyAI – AI-powered financial clarity" />
        <meta
          property="og:description"
          content="Structured financial insights, smart analysis and AI-powered optimization."
        />
        <meta property="og:image" content={`${siteUrl}/wealthyai/wealthyai.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* TWITTER / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="WealthyAI – AI-powered financial clarity" />
        <meta
          name="twitter:description"
          content="Structured financial insights and AI-powered optimization."
        />
        <meta name="twitter:image" content={`${siteUrl}/wealthyai/wealthyai.png`} />
      </Head>

      {/* ==== A MEGLÉVŐ OLDALAD VÁLTOZTATÁS NÉLKÜL ==== */}
      <main
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#060b13",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/wealthyai/wealthyai.png')",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "white",
          fontFamily: "Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* TOP NAV */}
        <div style={{ position: "absolute", top: 30, right: 40, display: "flex", gap: 28 }}>
          <a href="/how-it-works">How it works</a>
          <a href="/how-to-use">How to use</a>
          <a href="/terms">Terms</a>
        </div>

        {/* CENTER */}
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "3.6rem" }}>WealthyAI</h1>
          <p style={{ maxWidth: 520 }}>
            AI-powered financial thinking. Structured insights. Clear perspective.
          </p>
        </div>

        {/* START */}
        <a href="/start" style={{ position: "absolute", left: "10%", top: "45%" }}>
          Start
        </a>

        {/* FOOTER */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            padding: "18px 30px",
            display: "flex",
            justifyContent: "space-between",
            background: "rgba(0,0,0,0.35)",
          }}
        >
          <div>© 2026 WealthyAI</div>
          <div style={{ display: "flex", gap: 18 }}>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${siteUrl}`} target="_blank">
              <img src="/wealthyai/icons/fb.png" width={34} />
            </a>
            <a href={`https://twitter.com/intent/tweet?url=${siteUrl}`} target="_blank">
              <img src="/wealthyai/icons/x.png" width={34} />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${siteUrl}`}
              target="_blank"
            >
              <img src="/wealthyai/icons/insta.png" width={34} />
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
