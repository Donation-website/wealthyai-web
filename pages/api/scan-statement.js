import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import Busboy from 'busboy';

export const config = {
  api: {
    bodyParser: false, // Ez marad false, mi kezeljük a streamet
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const endpoint = process.env.AZURE_DOCUMENT_INTEGRATION_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTEGRATION_KEY;

  if (!endpoint || !key) return res.status(500).json({ error: "Azure credentials missing." });

  try {
    const buffer = await new Promise((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      let chunks = [];

      busboy.on('file', (name, file, info) => {
        file.on('data', (data) => chunks.push(data));
        file.on('end', () => resolve(Buffer.concat(chunks)));
      });

      busboy.on('error', (err) => reject(err));
      req.pipe(busboy);
    });

    // Azure Analízis közvetlenül a memóriából (Buffer)
    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    const poller = await client.beginAnalyzeDocument("prebuilt-layout", buffer);
    const result = await poller.pollUntilDone();
    
    const { tables, content } = result;

    let income = 0;
    let totalExpenses = 0;

    const parseNumber = (text) => {
      if (!text) return NaN;
      let clean = text.replace(/[^0-9.,-]/g, "");
      if (clean.includes(",") && clean.includes(".")) {
        const lastComma = clean.lastIndexOf(",");
        const lastDot = clean.lastIndexOf(".");
        clean = lastComma > lastDot ? clean.replace(/\./g, "").replace(",", ".") : clean.replace(/,/g, "");
      } else if (clean.includes(",")) {
        clean = clean.replace(",", ".");
      }
      return parseFloat(clean);
    };

    const keywords = {
      income: ["beérkezés", "jóváírás", "incoming", "credit", "deposit", "fizetés", "salary", "bevétel"],
      expense: ["kifizetés", "terhelés", "outgoing", "debit", "withdrawal", "spent", "vásárlás", "kártyás", "kiadás"]
    };

    // Szöveges feldolgozás
    content.split('\n').forEach(line => {
      const lowerLine = line.toLowerCase();
      const isTotal = lowerLine.includes("összesen") || lowerLine.includes("total") || lowerLine.includes("sum");
      if (isTotal) {
        const n = parseNumber(line);
        if (!isNaN(n)) {
          if (keywords.income.some(k => lowerLine.includes(k))) income = Math.max(income, n);
          if (keywords.expense.some(k => lowerLine.includes(k))) totalExpenses = Math.max(totalExpenses, Math.abs(n));
        }
      }
    });

    // Ha nincs adat, táblázat fallback
    if (income === 0 && totalExpenses === 0 && tables) {
      tables.forEach(table => {
        table.cells.forEach(cell => {
          const num = parseNumber(cell.content);
          if (!isNaN(num) && num !== 0) {
            const lowCell = cell.content.toLowerCase();
            if (keywords.income.some(k => lowCell.includes(k))) income += Math.abs(num);
            else if (keywords.expense.some(k => lowCell.includes(k))) totalExpenses += Math.abs(num);
          }
        });
      });
    }

    return res.status(200).json({
      income: Math.round(income),
      fixed: Math.round(totalExpenses * 0.65),
      variable: Math.round(totalExpenses * 0.35),
      status: (income > 0 || totalExpenses > 0) ? "success" : "manual_needed"
    });

  } catch (error) {
    console.error("DETAILED_ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
