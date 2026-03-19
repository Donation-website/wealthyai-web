import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import Busboy from 'busboy';

// Kényszerítjük a Node.js runtime-ot (Vercel néha elvált Edge-re, ahol nincs Busboy)
export const runtime = 'nodejs';

export const config = {
  api: {
    bodyParser: false, // Ez KELL a Busboy-hoz
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

  try {
    const { buffer, contentType } = await new Promise((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      let chunks = [];
      let fileDetected = false;
      let mimeType = "application/pdf";

      busboy.on('file', (fieldname, file, info) => {
        fileDetected = true;
        mimeType = info.mimeType;
        file.on('data', (data) => chunks.push(data));
      });

      busboy.on('finish', () => {
        if (!fileDetected) reject(new Error("Busboy: Nem érkezett fájl a kérésben. Ellenőrizd a FormData 'file' kulcsát!"));
        else resolve({ buffer: Buffer.concat(chunks), contentType: mimeType });
      });

      busboy.on('error', (err) => reject(err));
      
      // Hibakezelés, ha a kérés nem multipart
      if (!req.pipe) reject(new Error("Request is not pipeable"));
      req.pipe(busboy);

      setTimeout(() => reject(new Error("Upload Timeout (10s)")), 10000);
    });

    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    
    // Azure hívás explicit tartalomtípussal
    const poller = await client.beginAnalyzeDocument("prebuilt-layout", buffer, {
      contentType: contentType
    });
    
    const result = await poller.pollUntilDone();
    const { content } = result;

    // Egyszerűsített nemzetközi parsing
    const parse = (t) => parseFloat(t.replace(/[^0-9.,-]/g, "").replace(",", "."));
    let income = 0, expenses = 0;

    if (content) {
      content.split('\n').forEach(line => {
        const l = line.toLowerCase();
        if (l.includes("total") || l.includes("sum") || l.includes("összesen")) {
          const n = parse(line);
          if (!isNaN(n)) {
            if (["salary", "fizetés", "credit", "incoming"].some(k => l.includes(k))) income = Math.max(income, n);
            else expenses = Math.max(expenses, Math.abs(n));
          }
        }
      });
    }

    return res.status(200).json({
      income: Math.round(income) || 0,
      fixed: Math.round(expenses * 0.65) || 0,
      variable: Math.round(expenses * 0.35) || 0,
      status: "success"
    });

  } catch (error) {
    console.error("Vercel API Error:", error.message);
    return res.status(500).json({ error: error.message, status: "error" });
  }
}
