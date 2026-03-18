import Head from "next/head";

const DEFAULT_SITE_URL = "https://mywealthyai.com";
// Frissítve a share-card-v2.png-re
const DEFAULT_OG_IMAGE = "https://mywealthyai.com/wealthyai/icons/share-card-v2.png";

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

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Head>
  );
}
