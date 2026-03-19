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
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) throw new Error("No file uploaded");
    
    const arrayBuffer = await file.arrayBuffer();

    // 1. AZURE HÍVÁS (A prebuilt-layout alapból többoldalas!)
    const azureUrl = `${endpoint}/formrecognizer/documentModels/prebuilt-layout:analyze?api-version=2023-07-31`;
    const response = await fetch(azureUrl, {
      method: 'POST',
      headers: { 'Ocp-Apim-Subscription-Key': key!, 'Content-Type': 'application/octet-stream' },
      body: arrayBuffer
    });

    const operationLocation = response.headers.get('operation-location');
    if (!operationLocation) throw new Error("Azure initial call failed");

    // 2. VÁRAKOZÁS
    let result;
    const startTime = Date.now();
    while (true) {
      if (Date.now() - startTime > 25000) throw new Error("Azure Timeout");
      const check = await fetch(operationLocation, { headers: { 'Ocp-Apim-Subscription-Key': key! } });
      result = await check.json();
      if (result.status === 'succeeded') break;
      if (result.status === 'failed') throw new Error("Azure OCR failed");
      await new Promise(r => setTimeout(r, 1000));
    }

    // 3. JAVÍTOTT PÉNZ-LOGIKA
    let income = 0;
    let expenses = 0;

    const analyzeResult = result.analyzeResult;

    // Szigorúbb szűrő a számlaszámok és szemét ellen
    const extractStrictAmount = (text: string) => {
      // 1. Szóközök törlése, de a mínuszjelet megtartjuk
      const clean = text.replace(/\s/g, '');
      
      // 2. ANTI-SZÁMLASZÁM: Ha túl hosszú a számsor (pl. 57600118...), az nem összeg
      const digitsOnly = clean.replace(/[^0-9]/g, '');
      if (digitsOnly.length > 8) return null; // Egy tranzakció ritkán 100 milliónál több

      // 3. Formázás: vessző pontra cserélése
      const normalized = clean.replace(',', '.').replace(/[^-0-9.]/g, '');
      const val = parseFloat(normalized);
      
      if (!isNaN(val) && Math.abs(val) > 10) return val; 
      return null;
    };

    // --- ITT A LÉNYEG: VÉGIGMEGYÜNK MINDEN OLDALON ---
    analyzeResult.pages.forEach((page: any) => {
      page.lines.forEach((line: any) => {
        const val = extractStrictAmount(line.content);
        if (val !== null) {
          const txt = line.content.toLowerCase();
          
          // Ha negatív, vagy kiadásra utaló szó van mellette
          if (val < 0 || /-|terhelés|kiadás|vásárlás|díj|kamat/i.test(txt)) {
            expenses += Math.abs(val);
          } 
          // Ha pozitív és bevételre utaló szó
          else if (/fizetés|salary|bevétel|jóváírás|betét/i.test(txt)) {
            income += Math.abs(val);
          }
        }
      });
    });

    // 4. VÁLASZ
    return new Response(JSON.stringify({
      income: Math.round(income),
      fixed: Math.round(expenses * 0.6),
      variable: Math.round(expenses * 0.4),
      timestamp: Date.now(), 
      status: "success",
      pagesRead: analyzeResult.pages.length // Visszaküldjük, hány oldalt látott
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message, status: "error" }), { 
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
})
