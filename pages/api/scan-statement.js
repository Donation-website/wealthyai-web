import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";

export const config = {
  api: {
    bodyParser: false, // Ki kell kapcsolni, mert fájlt (binary) küldünk
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  // 1. Kulcsok kiolvasása a Vercel környezeti változókból
  const endpoint = process.env.AZURE_DOCUMENT_INTEGRATION_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTEGRATION_KEY;

  if (!endpoint || !key) {
    return res.status(500).json({ error: "Azure credentials are not configured on Vercel." });
  }

  try {
    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    
    // Itt jön a varázslat: az Azure "prebuilt-receipt" vagy "prebuilt-layout" modelljét használjuk
    // A banki kivonatokhoz a 'prebuilt-layout' a legstabilabb globálisan
    const poller = await client.beginAnalyzeDocument("prebuilt-layout", req.body);
    const { documents } = await poller.pollUntilDone();

    // Egyszerűsített logika a számok kinyeréséhez (ezt finomíthatjuk a kivonataitok alapján)
    // Most egyelőre visszaadunk egy példa objektumot, amit az Azure talált
    // (A valódi logikához látnom kellene egy minta JSON-t, amit az Azure köp ki)
    
    res.status(200).json({
      income: 5500, // Teszt adat - itt lesz az Azure-ból kinyert összeg
      fixed: 2100,
      variable: 1400
    });

  } catch (error) {
    console.error("Azure Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze document" });
  }
}
