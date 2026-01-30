export default function handler(req, res) {
  try {
    // Vercel által biztosított országkód (ISO-2)
    const country =
      req.headers["x-vercel-ip-country"] ||
      req.headers["x-forwarded-country"] ||
      "UN";

    // EU országkódok (ISO-2)
    const EU_COUNTRIES = [
      "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR",
      "DE","GR","IE","IT","LV","LT","LU","MT","NL","PL",
      "PT","RO","SK","SI","ES","SE"
    ];

    let region = "OTHER";

    if (country === "HU") {
      region = "HU";
    } else if (country === "US") {
      region = "US";
    } else if (country === "GB") {
      region = "UK";
    } else if (EU_COUNTRIES.includes(country)) {
      region = "EU";
    }

    return res.status(200).json({
      region,
      country,
    });

  } catch (err) {
    // Hard fallback – soha nem törhet
    return res.status(200).json({
      region: "OTHER",
      country: "UN",
    });
  }
}
