export default async function handler(req, res) {
  // Megnézzük, hogy a Vercel látja-e a változókat (csak az első pár karaktert írjuk ki biztonság miatt)
  const hasKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY ? "IGEN" : "NEM";
  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT || "HIÁNYZIK";

  console.log("Debug: Kulcs megvan?", hasKey);
  console.log("Debug: Endpoint:", endpoint);

  if (req.method === "POST") {
    return res.status(200).json({ 
      income: 500000, 
      fixed: 150000, 
      variable: 50000, 
      status: "success",
      debug_info: "Ez egy teszt válasz, hogy lássuk, él-e az API."
    });
  }

  return res.status(405).json({ message: "Csak POST hívás megengedett." });
}
