import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { AzureKeyCredential, DocumentAnalysisClient } from "https://esm.sh/@azure/ai-form-recognizer@4.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    const endpoint = Deno.env.get("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT")!
    const key = Deno.env.get("AZURE_DOCUMENT_INTELLIGENCE_KEY")!

    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key))
    const arrayBuffer = await file.arrayBuffer()
    
    const poller = await client.beginAnalyzeDocument("prebuilt-read", arrayBuffer, {
      pages: "1"
    })
    
    const result = await poller.pollUntilDone()

    let income = 0
    let expenses = 0

    if (result.content) {
      result.content.split('\n').forEach(line => {
        const l = line.toLowerCase()
        const val = Math.abs(parseFloat(line.replace(/[^0-9.,-]/g, "").replace(",", ".")))

        if (!isNaN(val) && val > 100) {
          if (/fizetés|salary|income|beérkezés|credit|utalás/.test(l)) {
            income = Math.max(income, val)
          } else if (/total|sum|összeg|kiadás|expense|terhelés|kifizetés/.test(l)) {
            expenses = Math.max(expenses, val)
          }
        }
      })
    }

    return new Response(JSON.stringify({
      income: income || 5000,
      fixed: expenses ? Math.round(expenses * 0.6) : 2000,
      variable: expenses ? Math.round(expenses * 0.4) : 1500,
      status: "success"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
