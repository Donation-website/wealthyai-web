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

    // 1. AZURE HÍVÁS (Prebuilt-layout: felismeri a táblázatokat és minden oldalt beolvas)
    const azureUrl = `${endpoint}/formrecognizer/documentModels/prebuilt-layout:analyze?api-version=2023-07-31`;
    const response = await fetch(azureUrl, {
      method: 'POST',
      headers: { 
        'Ocp-Apim-Subscription-Key': key!, 
        'Content-Type': 'application/octet-stream' 
      },
      body: arrayBuffer
    });

    const operationLocation = response.headers.get('operation-location');
    if (!operationLocation) throw new Error("Azure initial call failed");

    // 2. VÁRAKOZÁS AZ EREDMÉNYRE
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

    // 3. NEMZETKÖZI PÉNZ-LOGIKA
    let income = 0;
    let expenses = 0;

    const analyzeResult = result.analyzeResult;

    // Szigorú szűrő: megkülönbözteti az összeget a számlaszámoktól és dátumoktól
    const extractStrictAmount = (text: string) => {
      // Szóközök és felesleges karakterek takarítása, de a mínuszjelet és tizedest megtartjuk
      const clean = text.replace(/\s/g, '');
      
      // ANTI-SZÁMLASZÁM VÉDELEM: 
      // Ha 8-nál több számjegy van benne (pl. számlaszám: 57600118...), azt eldobjuk.
      const digitsOnly = clean.replace(/[^0-9]/g, '');
      if (digitsOnly.length > 8 || digitsOnly.length === 0) return null;

      // Magyar (vessző) és Nemzetközi (pont) formátum kezelése
      const normalized = clean.replace(',', '.').replace(/[^-0-9.]/g, '');
      const val = parseFloat(normalized);
      
      // Csak a releváns (10 egység feletti) összegeket nézzük, hogy a zajt kiszűrjük
      if (!isNaN(val) && Math.abs(val) > 10) return val; 
      return null;
    };

    // FELDOLGOZÁS: Végigmegyünk az ÖSSZES oldalon
    analyzeResult.pages.forEach((page: any) => {
      page.lines.forEach((line: any) => {
        const val = extractStrictAmount(line.content);
        if (val !== null) {
          const txt = line.content.toLowerCase();
          
          // NEMZETKÖZI KULCSSZAVAK (Angol + Magyar)
          
          // 1. KIADÁS jelei
          const isExpense = val < 0 || 
            /(-|fee|charge|expense|payment|purchase|debit|withdrawal|card|terhelés|kiadás|vásárlás|díj|kamat|költség)/i.test(txt);
          
          // 2. BEVÉTEL jelei
          const isIncome = !isExpense && 
            /(salary|income|deposit|credit|transfer in|bonus|bevétel|jóváírás|fizetés|betét|jutalom)/i.test(txt);

          // 3. EGYENLEG SZŰRŐ (hogy a záróegyenleget ne számolja kiadásnak/bevételnek)
          const isBalance = /balance|egyenleg|nyitó|záró/i.test(txt);

          if (!isBalance) {
            if (isExpense) {
              expenses += Math.abs(val);
            } else if (isIncome) {
              income += Math.abs(val);
            } else {
              // Ha nincs kulcsszó, de pozitív szám, alapértelmezetten kiadásnak vesszük 
              // (ez a biztonságosabb becslés bankkivonatoknál)
              expenses += val;
            }
          }
        }
      });
    });

    // 4. VÁLASZ (Visszaküldjük a feldolgozott adatokat)
    return new Response(JSON.stringify({
      income: Math.round(income),
      fixed: Math.round(expenses * 0.6), // 60/40 szabály alapértelmezettnek
      variable: Math.round(expenses * 0.4),
      timestamp: Date.now(), 
      status: "success",
      pagesRead: analyzeResult.pages.length,
      currency: analyzeResult.content.includes('EUR') ? 'EUR' : 'HUF' // Egyszerű valuta detektálás
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err: any) {
    return new Response(JSON.stringify({ 
      error: err.message, 
      status: "error",
      income: 0 
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
})
