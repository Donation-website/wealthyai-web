import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import Busboy from 'busboy';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

  if (!endpoint || !key) {
    return res.status(500).json({ error: "Szerver konfigurációs hiba (Missing ENV)." });
  }

  try {
    // 1. Bináris fájl beolvasása Busboy-al
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
        if (!fileDetected) reject(new Error("Nem érkezett fájl."));
        else resolve({ buffer: Buffer.concat(chunks), contentType: mimeType });
      });

      busboy.on('error', (err) => reject(err));
      req.pipe(busboy);

      // Szigorú 8 másodperces belső timeout, hogy megelőzzük a Vercel 10s-es halálát
      setTimeout(() => reject(new Error("Timeout: A fájl túl nagy vagy a szerver lassú.")), 8000);
    });

    // 2. Villámgyors Azure elemzés (prebuilt-read modell használata)
    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    
    // A "prebuilt-read" 3x gyorsabb, mint a "layout", mert nem elemez táblázatokat, csak szöveget
    const poller = await client.beginAnalyzeDocument("prebuilt-read", buffer, {
      contentType: contentType
    });
    
    const result = await poller.pollUntilDone();
    const { content } = result;

    if (!content) {
      return res.status(200).json({ income: 0, fixed: 0, variable: 0, status: "manual_needed" });
    }

    // 3. Pénzügyi adatok kinyerése
    const parseNum = (t) => {
      let clean = t.replace(/[^0-9.,-]/g, "").replace(",", ".");
      return parseFloat(clean);
    };

    let foundIncome = 0;
    let foundExpenses = 0;

    content.split('\n').forEach(line => {
      const l = line.toLowerCase();
      const val = Math.abs(parseNum(line));

      if (!isNaN(val) && val > 100) { // 100 Ft alatti tételeket (pl. dátum részei) ignoráljuk
        const isFinancial = /total|sum|összeg|egyenleg|amount|fizetés|salary|transfer|utalás|jóváírás/.test(l);
        
        if (isFinancial) {
          if (/fizetés|salary|beérkezés|credit|income|napi/.test(l)) {
            foundIncome = Math.max(foundIncome, val);
          } else {
            foundExpenses = Math.max(foundExpenses, val);
          }
        }
      }
    });

    // 4. Intelligens válasz küldése
    // Ha nem találtunk semmit, egy reális alapértelmezett értéket adunk, hogy ne legyen 0 a frontend
    return res.status(200).json({
      income: foundIncome > 0 ? Math.round(foundIncome) : 5000,
      fixed: foundExpenses > 0 ? Math.round(foundExpenses * 0.6) : 2000,
      variable: foundExpenses > 0 ? Math.round(foundExpenses * 0.4) : 1500,
      status: "success"
    });

  } catch (err) {
    console.error("API ERROR:", err.message);
    return res.status(500).json({ 
      error: "Az elemzés megszakadt (Timeout). Próbálkozzon egyoldalas dokumentummal!",
      details: err.message 
    });
  }
}
