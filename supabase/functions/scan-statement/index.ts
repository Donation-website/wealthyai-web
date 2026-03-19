import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 1. ELŐKÉSZÜLETEK
    const endpoint = Deno.env.get("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT")?.replace(/\/$/, "");
    const key = Deno.env.get("AZURE_DOCUMENT_INTELLIGENCE_KEY");
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const arrayBuffer = await file.arrayBuffer();

    // 2. AZURE HÍVÁS (Layout modell - a táblázatok mestere)
    const azureUrl = `${endpoint}/formrecognizer/documentModels/prebuilt-layout:analyze?api-version=2023-07-31`;
    const response = await fetch(azureUrl, {
      method: 'POST',
      headers: { 'Ocp-Apim-Subscription-Key': key!, 'Content-Type': 'application/octet-stream' },
      body: arrayBuffer
    });

    const operationLocation = response.headers.get('operation-location');
    let result;
    while (true) {
      const check = await fetch(operationLocation!, { headers: { 'Ocp-Apim-Subscription-Key': key! } });
      result = await check.json();
      if (result.status === 'succeeded') break;
      await new Promise(r => setTimeout(r, 1000));
    }

    // 3. AZ "EMBERI" LOGIKA - Itt dől el minden
    let income = 0;
    let expenses = 0;

    // Segédfüggvény: Csak a valós összegeket tartja meg (szűri a számlaszámokat)
    const cleanAmount = (text: string) => {
      const numStr = text.replace(/\s(?=\d)/g, "").replace(/[^0-9,.-]/g, "").replace(",", ".");
      const val = parseFloat(numStr);
      // Ha a szám 1 és 5.000.000 között van, akkor pénz. Ha nagyobb, akkor csak egy ID/számlaszám.
      return (!isNaN(val) && Math.abs(val) > 1 && Math.abs(val) < 5000000) ? val : null;
    };

    const content = result.analyzeResult;

    // A: TÁBLÁZATOK SCANELÉSE (Banki PDF-ekhez)
    content.tables?.forEach((table: any) => {
      table.cells.forEach((cell: any) => {
        const val = cleanAmount(cell.content);
        if (val !== null) {
          const txt = cell.content.toLowerCase();
          // Irány meghatározása: negatív jel vagy kulcsszó
          if (cell.content.includes("-") || /terhelés|kiadás|expense|total/i.test(txt)) {
            expenses += Math.abs(val);
          } else if (/fizetés|salary|income|kamat|jóváírás/i.test(txt)) {
            income += val;
          }
        }
      });
    });

    // B: SOROK SCANELÉSE (Mobil app képernyőfotókhoz)
    if (income === 0 && expenses === 0) {
      content.content.split('\n').forEach((line: string) => {
        const val = cleanAmount(line);
        if (val !== null) {
          const l = line.toLowerCase();
          if (/fizetés|salary|income|kamat|jóváírás/i.test(l)) income += val;
          else if (/összesen|total|sum|kiadás|vásárlás|-/i.test(l)) expenses += Math.abs(val);
        }
      });
    }

    // 4. VÉGEREDMÉNY (Szépen kerekítve, AI-kész formátumban)
    const finalResponse = {
      income: Math.round(income),
      fixed: Math.round(expenses * 0.6),
      variable: Math.round(expenses * 0.4),
      status: "success",
      debug: { found_income: income, found_expenses: expenses } // Ezt te is látod a logban
    };

    return new Response(JSON.stringify(finalResponse), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
})
