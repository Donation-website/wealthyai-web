import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import Busboy from 'busboy';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

  try {
    const buffer = await new Promise((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      let chunks = [];
      busboy.on('file', (name, file) => {
        file.on('data', (d) => chunks.push(d));
        file.on('end', () => resolve(Buffer.concat(chunks)));
      });
      busboy.on('error', reject);
      req.pipe(busboy);
      setTimeout(() => reject(new Error("Timeout")), 10000);
    });

    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    // A Layout modell a legerősebb nemzetközi táblázatfelismeréshez
    const poller = await client.beginAnalyzeDocument("prebuilt-layout", buffer);
    const { content, tables } = await poller.pollUntilDone();

    let income = 0, expenses = 0;
    
    // Univerzális számformázó (kezeli a 1.234,56 és 1,234.56 formátumot is)
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

    // Nemzetközi kulcsszavak
    const keywords = {
      inc: ["fizetés", "salary", "beérkezés", "credit", "incoming", "deposit", "gehalt", "lohn"],
      exp: ["kifizetés", "total expenses", "outgoing", "debit", "withdrawal", "ausgaben", "spent"]
    };

    content.split('\n').forEach(line => {
      const l = line.toLowerCase();
      // Összesítő sorok keresése (Total/Sum/Egyenleg)
      if (l.includes("total") || l.includes("összesen") || l.includes("sum") || l.includes("balance")) {
        const n = parse(line);
        if (!isNaN(n)) {
          if (keywords.inc.some(k => l.includes(k))) income = Math.max(income, n);
          else if (keywords.exp.some(k => l.includes(k))) expenses = Math.max(expenses, Math.abs(n));
        }
      }
    });

    return res.status(200).json({
      income: Math.round(income) || 0,
      fixed: Math.round(expenses * 0.65) || 0,
      variable: Math.round(expenses * 0.35) || 0,
      status: "success",
      currency_detected: content.includes("€") ? "EUR" : content.includes("$") ? "USD" : "HUF"
    });
  } catch (err) {
    console.error("Feldolgozási hiba:", err.message);
    return res.status(500).json({ error: "Sikertelen beolvasás. Kérjük, próbáljon tisztább dokumentumot!" });
  }
}
