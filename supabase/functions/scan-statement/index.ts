import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const endpoint = Deno.env.get("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT")?.replace(/\/$/, "");
    const key = Deno.env.get("AZURE_DOCUMENT_INTELLIGENCE_KEY");
    if (!endpoint || !key) throw new Error("Missing Azure Credentials");

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const arrayBuffer = await file.arrayBuffer();

    const azureUrl = `${endpoint}/formrecognizer/documentModels/prebuilt-layout:analyze?api-version=2023-07-31`;
    const response = await fetch(azureUrl, {
      method: 'POST',
      headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/octet-stream' },
      body: arrayBuffer
    });

    const operationLocation = response.headers.get('operation-location');
    let result;
    while (true) {
      const check = await fetch(operationLocation!, { headers: { 'Ocp-Apim-Subscription-Key': key } });
      result = await check.json();
      if (result.status === 'succeeded') break;
      await new Promise(r => setTimeout(r, 1000));
    }

    let income = 0;
    let expenses = 0;

    // SZIGORÚ SZÁMOLVASÓ: Csak a valós pénzösszegeket engedi át
    const parseStrictAmount = (text: string) => {
      // Kiszedünk mindent, ami nem szám, pont, vessző vagy mínusz
      const clean = text.replace(/\s(?=\d)/g, "").replace(/[^0-9,.-]/g, "").replace(",", ".");
      const val = parseFloat(clean);
      // SZŰRŐ: Ha a szám nagyobb mint 5 millió, az valószínűleg számlaszám vagy ID -> IGNORE
      if (isNaN(val) || Math.abs(val) > 5000000 || Math.abs(val) < 1) return null;
      return val;
    };

    // 1. PRIORITÁS: TÁBLÁZATOK (Banki PDF-hez)
    if (result.analyzeResult.tables && result.analyzeResult.tables.length > 0) {
      result.analyzeResult.tables.forEach((table: any) => {
        table.cells.forEach((cell: any) => {
          const val = parseStrictAmount(cell.content);
          if (val !== null) {
            const txt = cell.content.toLowerCase();
            const isNegative = cell.content.includes("-") || txt.includes("terhelés") || txt.includes("kiadás");
            const isPositive = txt.includes("jóváírás") || txt.includes("fizetés") || txt.includes("kamat");

            if (isNegative) expenses += Math.abs(val);
            else if (isPositive) income += val;
            // Ha az "Összesen" sorban vagyunk, az a legpontosabb
            else if (txt.includes("összesen")) {
                if (val < 0) expenses = Math.abs(val);
                else income = val;
            }
          }
        });
      });
    }

    // 2. PRIORITÁS: HA NINCS TÁBLÁZAT (Mobil fotóhoz)
    if (income === 0 && expenses === 0) {
      result.analyzeResult.content.split('\n').forEach((line: string) => {
        const val = parseStrictAmount(line);
        if (val !== null) {
          const l = line.toLowerCase();
          if (/fizetés|salary|income|kamat|jóváírás/i.test(l)) income += val;
          else if (/összesen|total|sum|kiadás|vásárlás|-/i.test(l)) expenses += Math.abs(val);
        }
      });
    }

    // 3. VÉGSŐ FORMÁZÁS AZ AI-NAK (Nincs több felesleges nulla!)
    return new Response(JSON.stringify({
      income: Math.round(income) || 0,
      fixed: Math.round(expenses * 0.6) || 0,
      variable: Math.round(expenses * 0.4) || 0,
      status: "success"
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
})
