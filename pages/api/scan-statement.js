import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const endpoint = process.env.AZURE_DOCUMENT_INTEGRATION_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTEGRATION_KEY;

  if (!endpoint || !key) return res.status(500).json({ error: "Azure credentials missing." });

  try {
    const buffer = await getRawBody(req);
    if (!buffer || buffer.length === 0) throw new Error("Empty request body");

    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    // A Layout modell a legjobb, mert látja a táblázatokat és a sima szöveget is
    const poller = await client.beginAnalyzeDocument("prebuilt-layout", buffer);
    const result = await poller.pollUntilDone();
    
    const { tables, content } = result;

    let income = 0;
    let totalExpenses = 0;

    // --- NEMZETKÖZI SZÁM PARSER ---
    const parseNumber = (text) => {
      if (!text) return NaN;
      // Tisztítás: csak számok, vessző, pont és mínusz marad
      let clean = text.replace(/[^0-9.,-]/g, "");
      
      // Ha van benne pont és vessző is (pl. 1,234.56 vagy 1.234,56)
      if (clean.includes(",") && clean.includes(".")) {
        const lastComma = clean.lastIndexOf(",");
        const lastDot = clean.lastIndexOf(".");
        if (lastComma > lastDot) { // Európai: 1.234,56
          clean = clean.replace(/\./g, "").replace(",", ".");
        } else { // Angolszász: 1,234.56
          clean = clean.replace(/,/g, "");
        }
      } else if (clean.includes(",")) { // Csak vessző: tizedesnek vesszük
        clean = clean.replace(",", ".");
      }
      return parseFloat(clean);
    };

    // --- NEMZETKÖZI KULCSSZAVAK (HU, EN, DE, FR) ---
    const keywords = {
      income: ["beérkezés", "jóváírás", "incoming", "credit", "deposit", "einzahlung", "revenu"],
      expense: ["kifizetés", "terhelés", "outgoing", "debit", "withdrawal", "auszahlung", "dépense", "spent"]
    };

    // 1. STRATÉGIA: ÖSSZESÍTŐ MEZŐK KERESÉSE A SZÖVEGBEN (Ez a legpontosabb)
    const lines = content.split('\n');
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Bevétel összesítő keresése
      if (keywords.income.some(k => lowerLine.includes(k)) && 
         (lowerLine.includes("összesen") || lowerLine.includes("total") || lowerLine.includes("summe"))) {
        const n = parseNumber(line);
        if (!isNaN(n) && n > income) income = n;
      }
      
      // Kiadás összesítő keresése
      if (keywords.expense.some(k => lowerLine.includes(k)) && 
         (lowerLine.includes("összesen") || lowerLine.includes("total") || lowerLine.includes("summe"))) {
        const n = parseNumber(line);
        if (!isNaN(n) && n > totalExpenses) totalExpenses = Math.abs(n);
      }
    }

    // 2. STRATÉGIA: HA NINCS ÖSSZESÍTŐ, AKKOR TÁBLÁZAT CELLÁK (De csak okosan!)
    if (income === 0 && totalExpenses === 0 && tables) {
      for (const table of tables) {
        for (const cell of table.cells) {
          const num = parseNumber(cell.content);
          if (isNaN(num) || num === 0) continue;

          const lowCell = cell.content.toLowerCase();
          // Csak ha az oszlop fejlécében vagy a cellában benne van a kulcsszó
          if (keywords.income.some(k => lowCell.includes(k))) {
            income += Math.abs(num);
          } else if (keywords.expense.some(k => lowCell.includes(k))) {
            totalExpenses += Math.abs(num);
          }
        }
      }
    }

    // Biztonsági szűrő: ha irreálisan magas számot kapnánk (pl. egyenleg), korlátozzuk
    const hasData = (income > 0 || totalExpenses > 0);

    return res.status(200).json({
      income: hasData ? Math.round(income) : 0,
      fixed: hasData ? Math.round(totalExpenses * 0.65) : 0,
      variable: hasData ? Math.round(totalExpenses * 0.35) : 0,
      status: hasData ? "success" : "manual_needed",
      currency_detected: content.includes("HUF") ? "HUF" : content.includes("EUR") ? "EUR" : "USD"
    });

  } catch (error) {
    console.error("ANALYSIS_ERROR:", error.message);
    return res.status(500).json({ error: "Failed to process document." });
  }
}
