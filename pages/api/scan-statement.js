import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";

export const config = {
  api: {
    bodyParser: false, // Fontos: a nyers adatfolyamot mi dolgozzuk fel
  },
};

// Segédfüggvény a stream beolvasásához (Vercel környezetben ez kötelező)
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
    
    // A 'prebuilt-layout' modell felismeri a táblázatokat és a folyószöveget is (PDF, Image, TXT)
    const poller = await client.beginAnalyzeDocument("prebuilt-layout", buffer, {
      contentType: contentType
    });
    
    const { tables, content } = await poller.pollUntilDone();

    let income = 0;
    let totalExpenses = 0;

    // --- 1. LOGIKA: TÁBLÁZATOK ELEMZÉSE ---
    if (tables && tables.length > 0) {
      tables.forEach((table) => {
        table.cells.forEach((cell) => {
          // Számok megtisztítása: szóközök ki, ezres elválasztók ki, vessző pontra
          const cleanText = cell.content.replace(/\s/g, "");
          const val = cleanText.replace(/,/g, "."); 
          const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));

          if (!isNaN(num) && num !== 0) {
            const lowText = cell.content.toLowerCase();
            
            // Bővített nemzetközi kulcsszólista (Angol, Magyar, Német, Spanyol stb.)
            const isIncome = lowText.includes("credit") || lowText.includes("deposit") || 
                             lowText.includes("incoming") || lowText.includes("bej") || 
                             lowText.includes("fizet") || lowText.includes("gehalt") ||
                             lowText.includes("abono") || lowText.includes("ingreso");
            
            const isExpense = lowText.includes("debit") || lowText.includes("withdraw") || 
                              lowText.includes("outgoing") || lowText.includes("kiad") || 
                              lowText.includes("kivét") || lowText.includes("vásárlás") ||
                              lowText.includes("payment") || lowText.includes("charge") ||
                              lowText.includes("gasto") || lowText.includes("pago");

            if (isIncome && num > 0) {
              income += num;
            } else if (isExpense) {
              totalExpenses += Math.abs(num);
            } else if (num < 0) {
              // Ha nincs kulcsszó, de negatív a szám, az biztos kiadás
              totalExpenses += Math.abs(num);
            }
          }
        });
      });
    }

    // --- 2. LOGIKA: SZÖVEGBÁNYÁSZAT (Ha nincs táblázat, pl. TXT fájl esetén) ---
    if (income === 0 && totalExpenses === 0) {
      const lines = content.split('\n');
      lines.forEach(line => {
        const cleanLine = line.toLowerCase();
        // Regex a számok kereséséhez: kezeli a tizedeseket és az ezres tagolást
        const amountMatch = line.match(/(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/);
        
        if (amountMatch) {
          const foundNum = parseFloat(amountMatch[0].replace(/\s/g, "").replace(",", "."));
          if (!isNaN(foundNum)) {
            if (cleanLine.includes("income") || cleanLine.includes("salary") || cleanLine.includes("bevétel") || cleanLine.includes("total credit")) {
              income += foundNum;
            } else if (cleanLine.includes("expense") || cleanLine.includes("spent") || cleanLine.includes("kiadás") || cleanLine.includes("total debit")) {
              totalExpenses += foundNum;
            }
          }
        }
      });
    }

    // --- 3. FIX / VARIABLE BECSLÉS ---
    // A nemzetközi banki standardok alapján a kiadások kb. 65%-a fix (rezsi, lakbér, törlesztő)
    const fixed = totalExpenses * 0.65;
    const variable = totalExpenses * 0.35;

    // Hibakezelés: ha nem talált semmit, manual_needed státuszt küldünk
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
