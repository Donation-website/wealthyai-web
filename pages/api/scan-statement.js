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
    
    // A Layout modell PDF, Kép és TXT esetén is a legjobb választás
    const poller = await client.beginAnalyzeDocument("prebuilt-layout", buffer, {
      contentType: contentType
    });
    
    const { tables, content } = await poller.pollUntilDone();

    let income = 0;
    let totalExpenses = 0;

    // --- 1. LOGIKA: TÁBLÁZATOK (PDF/Kép esetén ez az elsődleges) ---
    if (tables && tables.length > 0) {
      tables.forEach((table) => {
        table.cells.forEach((cell) => {
          // Tisztítás: szóközök ki, ezres elválasztók ki, vessző pontra cserélése
          const cleanText = cell.content.replace(/\s/g, "").replace(/\s/g, "");
          const val = cleanText.replace(/,/g, "."); 
          const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));

          if (!isNaN(num) && num !== 0) {
            const lowText = cell.content.toLowerCase();
            // Nemzetközi kulcsszavak: Credit/Deposit/Incoming/Bejövő vs Debit/Withdrawal/Kimenő
            const isIncome = lowText.includes("credit") || lowText.includes("deposit") || 
                             lowText.includes("incoming") || lowText.includes("bej") || 
                             lowText.includes("fizet");
            
            const isExpense = lowText.includes("debit") || lowText.includes("withdraw") || 
                              lowText.includes("outgoing") || lowText.includes("kiad") || 
                              lowText.includes("kivét") || lowText.includes("vásárlás");

            if (isIncome && num > 0) income += num;
            else if (isExpense) totalExpenses += Math.abs(num);
            else if (num < 0) totalExpenses += Math.abs(num); 
          }
        });
      });
    }

    // --- 2. LOGIKA: SZÖVEGBÁNYÁSZAT (TXT vagy egyszerű PDF esetén) ---
    // Ha a táblázat nem adott eredményt, a teljes szövegtartalomban keresünk összegeket
    if (income === 0 && totalExpenses === 0) {
      // Regex ami keresi a számokat kulcsszavak után (pl: Total: 1200.50)
      const lines = content.split('\n');
      lines.forEach(line => {
        const cleanLine = line.toLowerCase();
        const amountMatch = line.match(/(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/);
        
        if (amountMatch) {
          const foundNum = parseFloat(amountMatch[0].replace(/\s/g, "").replace(",", "."));
          if (cleanLine.includes("income") || cleanLine.includes("salary") || cleanLine.includes("bevétel")) {
            income += foundNum;
          } else if (cleanLine.includes("expense") || cleanLine.includes("spent") || cleanLine.includes("kiadás")) {
            totalExpenses += foundNum;
          }
        }
      });
    }

    // --- 3. FIX / VARIABLE ELOSZTÁS ---
    // Mivel a banki kivonat nem mondja meg, mi a fix, a MyWealthyAI logikája szerint becsülünk
    const fixed = totalExpenses * 0.65; // Átlagos fix költség arány (lakhatás, előfizetések)
    const variable = totalExpenses * 0.35;

    res.status(200).json({
      income: Math.round(income) || null, 
      fixed: Math.round(fixed) || null,
      variable: Math.round(variable) || null,
      status: (income || totalExpenses) ? "success" : "manual_needed",
      debug: `Extracted from ${tables?.length || 0} tables and ${content.length} chars.`
    });

  } catch (error) {
    console.error("Azure Error:", error);
    res.status(500).json({ error: "Failed to process document." });
  }
}
