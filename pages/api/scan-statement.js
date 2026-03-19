import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import Busboy from 'busboy';

export const config = {
  api: {
    bodyParser: false, // Fontos: a Busboy kezeli a nyers adatfolyamot
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  // A Vercel dashboard alapján a pontos nevek:
  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

  if (!endpoint || !key) {
    console.error("HIBA: Azure környezeti változók hiányoznak!");
    return res.status(500).json({ error: "Szerver konfigurációs hiba (hiányzó kulcsok)." });
  }

  try {
    const buffer = await new Promise((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      let chunks = [];

      busboy.on('file', (name, file) => {
        file.on('data', (data) => chunks.push(data));
        file.on('end', () => resolve(Buffer.concat(chunks)));
      });

      busboy.on('error', (err) => reject(err));
      req.pipe(busboy);

      // Időtúllépés kezelése (15 másodperc)
      setTimeout(() => reject(new Error("Feltöltési időtúllépés")), 15000);
    });

    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    
    // Az elemzés indítása a memóriában tárolt bufferből
    const poller = await client.beginAnalyzeDocument("prebuilt-layout", buffer);
    const result = await poller.pollUntilDone();
    
    const { tables, content } = result;

    let income = 0;
    let totalExpenses = 0;

    const parseNumber = (text) => {
      if (!text) return NaN;
      let clean = text.replace(/[^0-9.,-]/g, "");
      // Magyar és nemzetközi formátum kezelése
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

    // Szöveges feldolgozás soronként
    if (content) {
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
    }

    // Táblázatos fallback, ha a szöveges feldolgozás nem talált semmit
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
    console.error("KRITIKUS HIBA AZ API-BAN:", error);
    return res.status(500).json({ error: error.message || "Ismeretlen hiba a feldolgozás során." });
  }
}
