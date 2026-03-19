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
    return res.status(500).json({ error: "Azure credentials missing from Vercel environment." });
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

    // --- SEGÉDFÜGGVÉNY A SZÁMOKHOZ ---
    const parseNumber = (text) => {
      if (!text) return NaN;
      // Kiszedünk minden létező szóköz-félét (normál, nem törő, stb.) és a vesszőt pontra cseréljük
      let clean = text.replace(/[\s\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\ufeff]/g, "");
      clean = clean.replace(/,/g, ".");
      // Csak a számot és az esetleges tizedespontot/mínuszjelet tartjuk meg
      const match = clean.match(/[-?]*\d+(\.\d+)?/);
      return match ? parseFloat(match[0]) : NaN;
    };

    // --- 1. LOGIKA: TÁBLÁZATOK ELEMZÉSE ---
    if (tables && tables.length > 0) {
      tables.forEach((table) => {
        table.cells.forEach((cell) => {
          const num = parseNumber(cell.content);

          if (!isNaN(num) && num !== 0) {
            const lowText = cell.content.toLowerCase();
            
            const isIncome = lowText.includes("credit") || lowText.includes("deposit") || 
                             lowText.includes("incoming") || lowText.includes("bej") || 
                             lowText.includes("fizet") || lowText.includes("gehalt") ||
                             lowText.includes("abono") || lowText.includes("ingreso") ||
                             lowText.includes("jóváírás"); // OTP specifikus
            
            const isExpense = lowText.includes("debit") || lowText.includes("withdraw") || 
                              lowText.includes("outgoing") || lowText.includes("kiad") || 
                              lowText.includes("kivét") || lowText.includes("vásárlás") ||
                              lowText.includes("payment") || lowText.includes("charge") ||
                              lowText.includes("gasto") || lowText.includes("pago") ||
                              lowText.includes("terhelés"); // OTP specifikus

            if (isIncome && num > 0) {
              income += num;
            } else if (isExpense) {
              totalExpenses += Math.abs(num);
            } else if (num < 0) {
              totalExpenses += Math.abs(num);
            }
          }
        });
      });
    }

    // --- 2. LOGIKA: SZÖVEGBÁNYÁSZAT (Ha a táblázat üres maradt) ---
    if (income === 0 && totalExpenses === 0) {
      const lines = content.split('\n');
      lines.forEach(line => {
        const cleanLine = line.toLowerCase();
        const num = parseNumber(line);
        
        if (!isNaN(num)) {
          if (cleanLine.includes("income") || cleanLine.includes("salary") || cleanLine.includes("bevétel") || 
              cleanLine.includes("total credit") || cleanLine.includes("beérkezés")) {
            income += num;
          } else if (cleanLine.includes("expense") || cleanLine.includes("spent") || cleanLine.includes("kiadás") || 
                     cleanLine.includes("total debit") || cleanLine.includes("kifizetés")) {
            totalExpenses += Math.abs(num);
          }
        }
      });
    }

    const fixed = totalExpenses * 0.65;
    const variable = totalExpenses * 0.35;
    const hasData = income > 0 || totalExpenses > 0;

    res.status(200).json({
      income: hasData ? Math.round(income) : null, 
      fixed: hasData ? Math.round(fixed) : null,
      variable: hasData ? Math.round(variable) : null,
      status: hasData ? "success" : "manual_needed",
      scanned: true,
      debug: `Found ${tables?.length || 0} tables and ${content.length} characters.`
    });

  } catch (error) {
    console.error("AZURE_SCAN_ERROR:", error.message);
    res.status(500).json({ 
      error: "Scan failed", 
      details: error.message,
      status: "error"
    });
  }
}
