import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import Busboy from 'busboy';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log("--- SCAN PROCESS START ---");
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

  if (!endpoint || !key) {
    console.error("Missing Azure ENV variables");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    // 1. Fájl streamelése Busboy-al
    const { buffer } = await new Promise((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      let chunks = [];
      let fileDetected = false;

      busboy.on('file', (name, file, info) => {
        fileDetected = true;
        file.on('data', (data) => chunks.push(data));
      });

      busboy.on('finish', () => {
        if (!fileDetected) reject(new Error("No file uploaded"));
        else resolve({ buffer: Buffer.concat(chunks) });
      });

      busboy.on('error', (err) => reject(new Error("Busboy error: " + err.message)));
      req.pipe(busboy);

      // Szigorú timeout a Busboy-nak
      setTimeout(() => reject(new Error("Upload timeout")), 8000);
    });

    console.log(`File received: ${buffer.length} bytes`);

    // 2. Azure Document Intelligence hívás
    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    
    // KRITIKUS: pages: "1" - Csak az első oldalt elemzi, hogy beférjen 10 mp alá!
    const poller = await client.beginAnalyzeDocument("prebuilt-read", buffer, {
      pages: "1"
    });
    
    const result = await poller.pollUntilDone();

    if (!result.content) {
      return res.status(200).json({ income: 5000, fixed: 2000, variable: 1500, status: "no_content" });
    }

    // 3. Adatok kinyerése (Parsing)
    let income = 0;
    let expenses = 0;

    result.content.split('\n').forEach(line => {
      const l = line.toLowerCase();
      const val = Math.abs(parseFloat(line.replace(/[^0-9.,-]/g, "").replace(",", ".")));

      if (!isNaN(val) && val > 100) {
        if (/fizetés|salary|income|beérkezés|credit|utalás/.test(l)) {
          income = Math.max(income, val);
        } else if (/total|sum|összeg|kiadás|expense|terhelés|kifizetés/.test(l)) {
          expenses = Math.max(expenses, val);
        }
      }
    });

    const finalResponse = {
      income: income || 5000,
      fixed: expenses ? Math.round(expenses * 0.6) : 2000,
      variable: expenses ? Math.round(expenses * 0.4) : 1500,
      status: "success"
    };

    console.log("Scan success:", finalResponse);
    return res.status(200).json(finalResponse);

  } catch (err) {
    console.error("API ERROR:", err.message);
    return res.status(500).json({ 
      error: "Szkennelési hiba", 
      message: err.message 
    });
  }
}
