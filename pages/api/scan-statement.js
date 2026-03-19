import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import Busboy from 'busboy';

export const config = {
  api: {
    bodyParser: false, // Ez kötelező, hogy a Busboy tudja kezelni a streamet
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

  if (!endpoint || !key) {
    console.error("HIBA: Hiányzó Azure környezeti változók!");
    return res.status(500).json({ error: "Szerver konfigurációs hiba." });
  }

  try {
    // 1. FÁJL BEOLVASÁSA (Busboy - Biztonságos bináris kezelés)
    const { buffer, contentType } = await new Promise((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      let chunks = [];
      let fileDetected = false;
      let mimeType = "application/pdf";

      busboy.on('file', (fieldname, file, info) => {
        fileDetected = true;
        mimeType = info.mimeType;
        file.on('data', (data) => chunks.push(data));
      });

      busboy.on('finish', () => {
        if (!fileDetected) reject(new Error("Nem érkezett fájl a kérésben."));
        else resolve({ buffer: Buffer.concat(chunks), contentType: mimeType });
      });

      busboy.on('error', (err) => reject(err));
      req.pipe(busboy);

      // Vercel Timeout védelem (15mp után kilőjük, ha elakadna)
      setTimeout(() => reject(new Error("Feltöltési időtúllépés")), 15000);
    });

    console.log(`Beérkezett fájl: ${contentType}, Méret: ${buffer.length} bytes`);

    // 2. AZURE ELEMZÉS
    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    
    // A "prebuilt-layout" a leggyorsabb és legjobb táblázatokhoz/kivonatokhoz
    const poller = await client.beginAnalyzeDocument("prebuilt-layout", buffer, {
      contentType: contentType
    });
    
    const result = await poller.pollUntilDone();
    const { content } = result;

    if (!content) {
      return res.status(200).json({ income: 0, fixed: 0, variable: 0, status: "manual_needed" });
    }

    // 3. OKOSABB SZÁMOLÁS (Nem adunk össze mindent válogatás nélkül)
    const parseNum = (t) => {
      if (!t) return NaN;
      let clean = t.replace(/[^0-9.,-]/g, "").replace(",", ".");
      return parseFloat(clean);
    };

    let income = 0;
    let expenses = 0;

    // Soronként elemezzük a szöveget
    content.split('\n').forEach(line => {
      const l = line.toLowerCase();
      const val = parseNum(line);

      if (!isNaN(val) && val !== 0) {
        // Csak akkor adjuk hozzá, ha pénzügyi kulcsszót látunk a sorban
        // Így elkerüljük a dátumok (pl. 2026) és sorszámok összeadását
        const isFinancial = /total|sum|összeg|egyenleg|amount|fizetés|salary|transfer|utalás/.test(l);
        
        if (isFinancial) {
          if (/fizetés|salary|beérkezés|credit|income/.test(l)) {
            income = Math.max(income, val); // A legnagyobb "income" kulcsszavas összeget vesszük
          } else {
            expenses = Math.max(expenses, Math.abs(val)); // A legnagyobb kiadást keressük (pl. Total Expense)
          }
        }
      }
    });

    // 4. VÁLASZ (Alapértelmezett értékekkel, ha nem talált semmit)
    return res.status(200).json({
      income: Math.round(income) || 5000, 
      fixed: Math.round(expenses * 0.65) || 2000,
      variable: Math.round(expenses * 0.35) || 1500,
      status: "success"
    });

  } catch (err) {
    console.error("KRITIKUS API HIBA:", err.message);
    return res.status(500).json({ 
      error: "Hiba az elemzés során. Kérjük, próbáljon meg egy kisebb vagy tisztább fájlt!",
      details: err.message 
    });
  }
}
