import Head from "next/head";

const DEFAULT_SITE_URL = "https://wealthyai-web.vercel.app";
const DEFAULT_OG_IMAGE =
  "https://wealthyai-web.vercel.app/wealthyai/icons/megosztas.png";

export default function SEO({
  title = "WealthyAI – AI-powered financial clarity",
  description = "AI-powered financial planning with structured insights and clear perspective.",
  url = DEFAULT_SITE_URL,
  ogImage = DEFAULT_OG_IMAGE,
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Head>
  );
}
