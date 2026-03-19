import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import Busboy from 'busboy';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

  try {
    const { buffer, contentType } = await new Promise((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      let chunks = [];
      let detectedType = "application/pdf";

      busboy.on('file', (name, file, info) => {
        detectedType = info.mimeType;
        file.on('data', (data) => chunks.push(data));
        file.on('end', () => {});
      });

      busboy.on('finish', () => {
        if (chunks.length === 0) reject(new Error("Üres fájl"));
        else resolve({ buffer: Buffer.concat(chunks), contentType: detectedType });
      });

      busboy.on('error', (err) => reject(err));
      req.pipe(busboy);
      setTimeout(() => reject(new Error("Feltöltési időtúllépés")), 10000);
    });

    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    
    // Itt küldjük el az Azure-nak explicit típusmegadással
    const poller = await client.beginAnalyzeDocument("prebuilt-layout", buffer, {
      contentType: contentType
    });
    
    const result = await poller.pollUntilDone();
    const { content } = result;

    const parseNum = (t) => {
      if (!t) return NaN;
      let clean = t.replace(/[^0-9.,-]/g, "").replace(",", ".");
      return parseFloat(clean);
    };

    let income = 0, expenses = 0;
    if (content) {
      content.split('\n').forEach(line => {
        const l = line.toLowerCase();
        if (l.includes("total") || l.includes("sum") || l.includes("összesen")) {
          const n = parseNum(line);
          if (!isNaN(n)) {
            if (["salary", "fizetés", "beérkezés", "credit"].some(k => l.includes(k))) income = Math.max(income, n);
            else expenses = Math.max(expenses, Math.abs(n));
          }
        }
      });
    }

    return res.status(200).json({
      income: Math.round(income),
      fixed: Math.round(expenses * 0.65),
      variable: Math.round(expenses * 0.35),
      status: "success"
    });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
