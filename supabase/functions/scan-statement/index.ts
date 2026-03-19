import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight kezelés
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. KÖRNYEZETI VÁLTOZÓK ÉS INPUT
    const endpoint = Deno.env.get("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT")?.replace(/\/$/, "");
    const key = Deno.env.get("AZURE_DOCUMENT_INTELLIGENCE_KEY");
    
    if (!endpoint || !key) {
      throw new Error("Hiányzó Azure konfiguráció (Endpoint vagy Key)!");
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) throw new Error("Nem érkezett fájl a kérésben.");
    
    const arrayBuffer = await file.arrayBuffer();

    // 2. AZURE ANALÍZIS INDÍTÁSA (Layout modell)
    const azureUrl = `${endpoint}/formrecognizer/documentModels/prebuilt-layout:analyze?api-version=2023-07-31`;
    
    const initialResponse = await fetch(azureUrl, {
      method: 'POST',
      headers: { 
        'Ocp-Apim-Subscription-Key': key, 
        'Content-Type': 'application/octet-stream' 
      },
      body: arrayBuffer
    });

    if (!initialResponse.ok) {
      const errorText = await initialResponse.text();
      throw new Error(`Azure indítási hiba: ${initialResponse.status} - ${errorText}`);
    }

    const operationLocation = initialResponse.headers.get('operation-location');
    if (!operationLocation) throw new Error("Nem kaptunk 'operation-location' fejlécet az Azure-tól.");

    // 3. VÁRAKOZÁS AZ EREDMÉNYRE (Max 20 másodperc, hogy ne legyen Supabase timeout)
    let result;
    let status = '';
    const startTime = Date.now();
    
    while (status !== 'succeeded') {
      // Ha már több mint 25 másodperce várunk, állítsuk le, hogy ne szálljon el a függvény
      if (Date.now() - startTime > 25000) {
        throw new Error("Azure feldolgozási időtúllépés (25s).");
      }

      const checkResponse = await fetch(operationLocation, {
        headers: { 'Ocp-Apim-Subscription-Key': key }
      });
      result = await checkResponse.json();
      status = result.status;

      if (status === 'failed') throw new Error("Azure elemzés sikertelen.");
      if (status !== 'succeeded') {
        await new Promise(r => setTimeout(r, 1500)); // 1.5 mp várakozás a következő próbáig
      }
    }

    // 4. ADATFELDOLGOZÁS - A "NULLA-GYILKOS" LOGIKA
    let income = 0;
    let expenses = 0;

    const parseMoneyValue = (rawText: string): number | null => {
      // Minden szóköz eltávolítása (Azure gyakran tesz szóközt ezresek közé)
      let clean = rawText.replace(/\s/g, '');
      
      // Csak számok, pont, vessző és mínuszjel maradjon
      clean = clean.replace(/[^-0-9.,]/g, '');

      // VALIDÁCIÓ: Ha több mint 11 jegyű (pont/vessző nélkül), akkor az fixen számlaszám/ID
      const digitsOnly = clean.replace(/[.,-]/g, '');
      if (digitsOnly.length > 11 || digitsOnly.length === 0) return null;

      // Formátum normalizálás (Magyar 1.200,50 -> 1200.50)
      if (clean.includes(',') && clean.includes('.')) {
        if (clean.indexOf(',') > clean.indexOf('.')) {
          clean = clean.replace(/\./g, '').replace(',', '.');
        } else {
          clean = clean.replace(/,/g, '');
        }
      } else {
        clean = clean.replace(',', '.');
      }

      const val = parseFloat(clean);
      // Ésszerűségi korlát: 10 Ft és 20 Millió Ft között per tétel
      return (!isNaN(val) && Math.abs(val) > 10 && Math.abs(val) < 20000000) ? val : null;
    };

    const analyzeResult = result.analyzeResult;

    // Elsődleges: Sorok szerinti beolvasás (Mobil screenshotokhoz és PDF-ekhez is stabilabb)
    analyzeResult.pages?.forEach((page: any) => {
      page.lines?.forEach((line: any) => {
        const val = parseMoneyValue(line.content);
        if (val !== null) {
          const lowerText = line.content.toLowerCase();
          
          // Kulcsszó alapú irányítás (Magyar + Nemzetközi)
          const isExpense = /-|kiadás|vásárlás|total|payment|fee|díj|terhelés|kamat/i.test(lowerText);
          const isIncome = /fizetés|salary|income|bevétel|kredit|jóváírás|utalt|transfer/i.test(lowerText);

          if (isExpense || val < 0) {
            expenses += Math.abs(val);
          } else if (isIncome) {
            income += Math.abs(val);
          }
        }
      });
    });

    // Másodlagos: Ha a sorokból nem jött ki semmi, nézzük a táblázatokat
    if (income === 0 && expenses === 0) {
      analyzeResult.tables?.forEach((table: any) => {
        table.cells.forEach((cell: any) => {
          const val = parseMoneyValue(cell.content);
          if (val !== null) {
            if (cell.content.includes('-') || val < 0) expenses += Math.abs(val);
            else income += val;
          }
        });
      });
    }

    // 5. VÁLASZADÁS
    const finalData = {
      income: Math.round(income),
      fixed: Math.round(expenses * 0.6), // MyWealthyAI alapbecslés: 60% fix
      variable: Math.round(expenses * 0.4), // 40% változó
      status: "success",
      debug: { raw_income: income, raw_expenses: expenses }
    };

    return new Response(JSON.stringify(finalData), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (err: any) {
    console.error("Hiba történt:", err.message);
    return new Response(JSON.stringify({ 
      error: err.message, 
      status: "error",
      income: 0, 
      fixed: 0, 
      variable: 0 
    }), { 
      status: 200, // 200-at adunk vissza, hogy a frontend ne crasheljen, csak mutassa a hibát
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
})
