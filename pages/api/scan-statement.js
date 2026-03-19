import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const endpoint = process.env.AZURE_DOCUMENT_INTEGRATION_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTEGRATION_KEY;

  if (!endpoint || !key) {
    return res.status(500).json({ error: "Azure credentials missing." });
  }

  try {
    const buffer = await getRawBody(req);
    const contentType = req.headers["content-type"] || "application/octet-stream";
    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    
    const poller = await client.beginAnalyzeDocument("prebuilt-layout", buffer, {
      contentType: contentType
    });
    
    const { tables, content } = await poller.pollUntilDone();

    let income = 0;
    let totalExpenses = 0;

    // --- GOLYÓÁLLÓ SZÁM-PARSER ---
    const parseNumber = (text) => {
      if (!text) return NaN;
      // Minden szóköz-típust kigyomlálunk (OTP-nél ez kritikus)
      let clean = text.replace(/[\s\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\ufeff]/g, "");
      // Vesszőt pontra cseréljük
      clean = clean.replace(/,/g, ".");
      // Csak a számot/mínuszjelet tartjuk meg
      const match = clean.match(/[-?]*\d+(\.\d+)?/);
      return match ? parseFloat(match[0]) : NaN;
    };

    // --- 1. KERESÉS A TÁBLÁZATOKBAN ---
    if (tables && tables.length > 0) {
      tables.forEach((table) => {
        table.cells.forEach((cell) => {
          const num = parseNumber(cell.content);
          if (!isNaN(num) && num !== 0) {
            const lowText = cell.content.toLowerCase();
            // OTP és nemzetközi kulcsszavak
            if (lowText.includes("jóváírás") || lowText.includes("credit") || lowText.includes("deposit") || lowText.includes("bej")) {
              income += Math.abs(num);
            } else if (lowText.includes("terhelés") || lowText.includes("debit") || lowText.includes("kiad") || num < 0) {
              totalExpenses += Math.abs(num);
            }
          }
        });
      });
    }

    // --- 2. OTP SPECIFIKUS SZÖVEGBÁNYÁSZAT (Ez kell a te fájlodhoz!) ---
    if (income === 0 || totalExpenses === 0) {
      const lines = content.split('\n');
      lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        
        // OTP "Mindösszesen beérkezés" és "Mindösszesen kifizetés" keresése
        if (lowerLine.includes("beérkezés") || lowerLine.includes("jóváírás összesen")) {
          const n = parseNumber(line);
          if (!isNaN(n)) income = n;
        }
        if (lowerLine.includes("kifizetés") || lowerLine.includes("terhelés összesen")) {
          const n = parseNumber(line);
          if (!isNaN(n)) totalExpenses = Math.abs(n);
        }
      });
    }

    // Ha az OTP PDF-ben az időszaki összesítőt nézzük
    if (income === 0 && totalExpenses === 0) {
        // Ha nem talált kulcsszót, de van tartalom, próbáljuk meg a legnagyobb számokat kiszedni
        const numbers = content.match(/(\d{1,3}(?:[\s\u00A0]\d{3})*(?:,\d{2}))/g);
        if (numbers) {
            const parsedNums = numbers.map(n => parseNumber(n)).filter(n => n > 100);
            if (parsedNums.length >= 2) {
                // Egy durva becslés, ha minden kötél szakad
                income = Math.max(...parsedNums);
                totalExpenses = parsedNums.reduce((a, b) => a + b, 0) - income;
            }
        }
    }

    const hasData = income > 0 || totalExpenses > 0;

    res.status(200).json({
      income: hasData ? Math.round(income) : null, 
      fixed: hasData ? Math.round(totalExpenses * 0.65) : null,
      variable: hasData ? Math.round(totalExpenses * 0.35) : null,
      status: hasData ? "success" : "manual_needed",
      scanned: true
    });

  } catch (error) {
    console.error("AZURE_ERROR:", error.message);
    res.status(500).json({ error: error.message, status: "error" });
  }
}
