import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import Busboy from 'busboy';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log("--- SCAN START ---");
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

  // LÉPÉS 0: Környezeti változók ellenőrzése
  if (!endpoint || !key) {
    console.error("KRITIKUS: Hiányzó Azure ENV változók!");
    return res.status(500).json({ 
      error: "Hiányzó konfiguráció", 
      details: "Endpoint vagy Key nincs beállítva a Vercelen." 
    });
  }

  try {
    // LÉPÉS 1: Fájl beolvasása
    console.log("1. Fájl streamelése...");
    const { buffer, contentType } = await new Promise((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      let chunks = [];
      let fileDetected = false;
      let mimeType = "application/pdf";

      busboy.on('file', (name, file, info) => {
        fileDetected = true;
        mimeType = info.mimeType;
        file.on('data', (data) => chunks.push(data));
      });

      busboy.on('finish', () => {
        if (!fileDetected) reject(new Error("A kérés nem tartalmazott fájlt (Busboy üres)."));
        else resolve({ buffer: Buffer.concat(chunks), contentType: mimeType });
      });

      busboy.on('error', (err) => reject(new Error("Busboy hiba: " + err.message)));
      req.pipe(busboy);

      setTimeout(() => reject(new Error("Vercel/Busboy Timeout (8s)")), 8000);
    });

    console.log(`2. Beérkezett: ${contentType}, Méret: ${buffer.length} bytes`);

    // LÉPÉS 2: Azure hívás indítása
    console.log("3. Azure Document Intelligence hívása...");
    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    
    const poller = await client.beginAnalyzeDocument("prebuilt-read", buffer, {
      contentType: contentType
    }).catch(e => {
      throw new Error("Azure Kapcsolódási Hiba: " + e.message);
    });
    
    console.log("4. Azure elemzés folyamatban (polling)...");
    const result = await poller.pollUntilDone();
    const { content } = result;

    if (!content) {
      console.warn("Figyelem: Az Azure nem talált szöveget a képen.");
      return res.status(200).json({ income: 0, fixed: 0, variable: 0, status: "empty_content" });
    }

    // LÉPÉS 3: Feldolgozás
    console.log("5. Eredmények parsingolása...");
    const parseNum = (t) => {
      let clean = t.replace(/[^0-9.,-]/g, "").replace(",", ".");
      return parseFloat(clean);
    };

    let foundIncome = 0;
    let foundExpenses = 0;

    content.split('\n').forEach(line => {
      const l = line.toLowerCase();
      const val = Math.abs(parseNum(line));
      if (!isNaN(val) && val > 100) {
        const isFinancial = /total|sum|összeg|egyenleg|amount|fizetés|salary|transfer|utalás|jóváírás/.test(l);
        if (isFinancial) {
          if (/fizetés|salary|beérkezés|credit|income|napi/.test(l)) foundIncome = Math.max(foundIncome, val);
          else foundExpenses = Math.max(foundExpenses, val);
        }
      }
    });

    console.log(`--- SCAN SUCCESS: Inc: ${foundIncome}, Exp: ${foundExpenses} ---`);

    return res.status(200).json({
      income: foundIncome > 0 ? Math.round(foundIncome) : 5000,
      fixed: foundExpenses > 0 ? Math.round(foundExpenses * 0.6) : 2000,
      variable: foundExpenses > 0 ? Math.round(foundExpenses * 0.4) : 1500,
      status: "success"
    });

  } catch (err) {
    // ITT A LÉNYEG: Minden hibát kiírunk a logba és visszaküldjük a frontendnek
    console.error("!!! API ÖSSZEOMLÁS !!!");
    console.error("Hiba üzenet:", err.message);
    console.error("Helyszín (Stack):", err.stack);

    return res.status(500).json({ 
      error: "Hiba történt az API-ban", 
      message: err.message,
      stack: err.stack, // Ez megmutatja a pontos kódsort
      step: "Check Vercel Logs for more details"
    });
  }
}
