import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";

export const config = {
  api: {
    bodyParser: false, // Ez marad, mert mi kezeljük a streamet
  },
};

// Stabilabb stream-to-buffer megoldás
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

  if (!endpoint || !key) {
    return res.status(500).json({ error: "Azure credentials missing." });
  }

  try {
    const buffer = await getRawBody(req);
    
    // Validáció: Ha üres a buffer, megállunk
    if (!buffer || buffer.length === 0) {
      throw new Error("Empty request body");
    }

    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    
    // A "prebuilt-layout" helyett bankkivonatokhoz a "prebuilt-read" is jó, 
    // de a layout jobb a táblázatokhoz.
    const poller = await client.beginAnalyzeDocument("prebuilt-layout", buffer);
    
    // Itt a hiba forrása lehet: a poller eredményét destrukturálni kell
    const { tables, content, pages } = await poller.pollUntilDone();

    let income = 0;
    let totalExpenses = 0;

    // --- GOLYÓÁLLÓ SZÁM-PARSER ---
    const parseNumber = (text) => {
      if (!text) return NaN;
      // Tisztítás: minden, ami nem szám, vessző, pont vagy mínuszjel, az megy
      let clean = text.replace(/[^0-9.,-]/g, "");
      
      // Ha magyar formátum (pl. 1.234,56), a pont ezres elválasztó, a vessző tizedes
      // De ha csak szóköz van (1 234,56), akkor a replace már kiszedte a szóközt.
      if (clean.includes(',') && clean.includes('.')) {
          clean = clean.replace(/\./g, "").replace(",", ".");
      } else if (clean.includes(',')) {
          clean = clean.replace(",", ".");
      }
      
      const val = parseFloat(clean);
      return isNaN(val) ? NaN : val;
    };

    // --- 1. TÁBLÁZAT ANALÍZIS ---
    if (tables && tables.length > 0) {
      for (const table of tables) {
        for (const cell of table.cells) {
          const num = parseNumber(cell.content);
          if (!isNaN(num) && num !== 0) {
            const lowText = cell.content.toLowerCase();
            
            // Logika finomítása: az OTP "Jóváírás" oszlopában a számok pozitívak
            if (lowText.includes("jóváírás") || lowText.includes("beérkezés")) {
              income += Math.abs(num);
            } else if (lowText.includes("terhelés") || lowText.includes("kifizetés") || num < 0) {
              totalExpenses += Math.abs(num);
            }
          }
        }
      }
    }

    // --- 2. BACKUP: HA A TÁBLÁZAT ÜRES, SORONKÉNTI KERESÉS ---
    if (income === 0 && totalExpenses === 0 && pages) {
        // Az Azure a content-ben ömlesztve adja vissza a szöveget, 
        // érdemesebb a pages[].lines-on végigmenni a pontosabb helymeghatározáshoz
        const fullText = pages.map(p => p.lines.map(l => l.content).join(" ")).join("\n");
        const lines = fullText.split('\n');

        lines.forEach(line => {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes("mindösszesen beérkezés") || lowerLine.includes("jóváírások összesen")) {
                const n = parseNumber(line);
                if (!isNaN(n)) income = n;
            }
            if (lowerLine.includes("mindösszesen kifizetés") || lowerLine.includes("terhelések összesen")) {
                const n = parseNumber(line);
                if (!isNaN(n)) totalExpenses = Math.abs(n);
            }
        });
    }

    const hasData = income > 0 || totalExpenses > 0;

    return res.status(200).json({
      income: hasData ? Math.round(income) : 0, 
      fixed: hasData ? Math.round(totalExpenses * 0.65) : 0,
      variable: hasData ? Math.round(totalExpenses * 0.35) : 0,
      status: hasData ? "success" : "manual_needed",
      scanned: true
    });

  } catch (error) {
    console.error("AZURE_ERROR:", error);
    return res.status(500).json({ error: error.message, status: "error" });
  }
}
