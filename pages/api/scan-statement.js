import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Fontos: a formidable fogja feldolgozni a törzset
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const endpoint = process.env.AZURE_DOCUMENT_INTEGRATION_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTEGRATION_KEY;

  if (!endpoint || !key) return res.status(500).json({ error: "Azure credentials missing." });

  // 1. Fájl kinyerése a FormData-ból
  const form = formidable({});
  let fields, files;
  
  try {
    [fields, files] = await form.parse(req);
    const file = files.file?.[0] || files.file; // Formidable verziótól függően lehet tömb
    
    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Fájl beolvasása bufferbe
    const buffer = fs.readFileSync(file.filepath);

    // 2. Azure Analízis
    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    const poller = await client.beginAnalyzeDocument("prebuilt-layout", buffer);
    const result = await poller.pollUntilDone();
    
    const { tables, content } = result;

    let income = 0;
    let totalExpenses = 0;

    // --- SZÁM PARSER ---
    const parseNumber = (text) => {
      if (!text) return NaN;
      let clean = text.replace(/[^0-9.,-]/g, "");
      if (clean.includes(",") && clean.includes(".")) {
        const lastComma = clean.lastIndexOf(",");
        const lastDot = clean.lastIndexOf(".");
        if (lastComma > lastDot) {
          clean = clean.replace(/\./g, "").replace(",", ".");
        } else {
          clean = clean.replace(/,/g, "");
        }
      } else if (clean.includes(",")) {
        clean = clean.replace(",", ".");
      }
      return parseFloat(clean);
    };

    const keywords = {
      income: ["beérkezés", "jóváírás", "incoming", "credit", "deposit", "einzahlung", "revenu", "fizetés"],
      expense: ["kifizetés", "terhelés", "outgoing", "debit", "withdrawal", "auszahlung", "dépense", "spent", "vásárlás"]
    };

    // 3. ADATKINYERÉS (A te logikád, kicsit stabilabbá téve)
    const lines = content.split('\n');
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      const isTotal = lowerLine.includes("összesen") || lowerLine.includes("total") || lowerLine.includes("summe");
      
      if (keywords.income.some(k => lowerLine.includes(k)) && isTotal) {
        const n = parseNumber(line);
        if (!isNaN(n) && n > income) income = n;
      }
      
      if (keywords.expense.some(k => lowerLine.includes(k)) && isTotal) {
        const n = parseNumber(line);
        if (!isNaN(n) && Math.abs(n) > totalExpenses) totalExpenses = Math.abs(n);
      }
    }

    // Ha nincs összesítő, nézzük a táblázatokat
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

    const hasData = (income > 0 || totalExpenses > 0);

    // Takarítás (opcionális, Vercel megoldja, de illik)
    if (file.filepath) fs.unlinkSync(file.filepath);

    return res.status(200).json({
      income: Math.round(income),
      fixed: Math.round(totalExpenses * 0.65),
      variable: Math.round(totalExpenses * 0.35),
      status: hasData ? "success" : "manual_needed"
    });

  } catch (error) {
    console.error("SERVER_ERROR:", error);
    return res.status(500).json({ error: "Failed to process document." });
  }
}
