import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import Busboy from 'busboy';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

  console.log("DEBUG: API hívás indult");
  console.log("DEBUG: Endpoint megvan:", !!endpoint);

  try {
    const { buffer, contentType } = await new Promise((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      let chunks = [];
      let detectedContentType = "";

      busboy.on('file', (name, file, info) => {
        // 1. FIX: Csak a "file" nevű fieldet fogadjuk el (vagy amit a frontend küld)
        detectedContentType = info.mimeType;
        
        file.on('data', (data) => chunks.push(data));
        file.on('end', () => {
          console.log(`DEBUG: Fájl beolvasva (${name}), méret: ${Buffer.concat(chunks).length} bytes`);
        });
      });

      busboy.on('finish', () => {
        if (chunks.length === 0) {
          reject(new Error("Nincs feltöltött fájl vagy rossz field név (használd a 'file' nevet!)"));
        } else {
          resolve({ 
            buffer: Buffer.concat(chunks), 
            contentType: detectedContentType 
          });
        }
      });

      busboy.on('error', (err) => reject(err));
      req.pipe(busboy);

      // Timeout védelem
      setTimeout(() => reject(new Error("Vercel/Busboy Upload Timeout")), 15000);
    });

    console.log("DEBUG: Azure küldés indítása...", contentType);

    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    
    // 2. FIX: Explicit contentType megadása az Azure-nak
    const poller = await client.beginAnalyzeDocument(
      "prebuilt-layout", 
      buffer, 
      { contentType: contentType || "application/pdf" }
    );
    
    const result = await poller.pollUntilDone();
    console.log("DEBUG: Azure válasz megérkezett");

    // Szám parsing javítása (nemzetközi)
    const parse = (t) => {
      if (!t) return NaN;
      let clean = t.replace(/[^0-9.,-]/g, "");
      if (clean.includes(",") && clean.includes(".")) {
        const lastC = clean.lastIndexOf(",");
        const lastD = clean.lastIndexOf(".");
        clean = lastC > lastD ? clean.replace(/\./g, "").replace(",", ".") : clean.replace(/,/g, "");
      } else {
        clean = clean.replace(",", ".");
      }
      return parseFloat(clean);
    };

    let income = 0, expenses = 0;
    const { content } = result;

    if (content) {
      content.split('\n').forEach(line => {
        const l = line.toLowerCase();
        if (l.includes("total") || l.includes("összesen") || l.includes("sum") || l.includes("balance")) {
          const n = parse(line);
          if (!isNaN(n)) {
            if (["salary", "fizetés", "credit", "beérkezés", "incoming"].some(k => l.includes(k))) {
              income = Math.max(income, n);
            } else {
              expenses = Math.max(expenses, Math.abs(n));
            }
          }
        }
      }
    });

    return res.status(200).json({
      income: Math.round(income) || 0,
      fixed: Math.round(expenses * 0.65) || 0,
      variable: Math.round(expenses * 0.35) || 0,
      status: (income > 0 || expenses > 0) ? "success" : "manual_needed",
      debug: { size: buffer.length, type: contentType }
    });

  } catch (error) {
    // 6. FIX: Részletes hiba logolás
    console.error("FULL ERROR OBJECT:", JSON.stringify(error, null, 2));
    return res.status(500).json({ 
      error: error.message, 
      details: error.code || "No error code" 
    });
  }
}
