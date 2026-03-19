import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { file, type } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No file received" });
    }

    const buffer = Buffer.from(file, "base64");

    console.log("BUFFER SIZE:", buffer.length);

    const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
    const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

    const client = new DocumentAnalysisClient(
      endpoint,
      new AzureKeyCredential(key)
    );

    const poller = await client.beginAnalyzeDocument(
      "prebuilt-layout",
      buffer,
      {
        contentType: type || "application/pdf",
      }
    );

    const result = await poller.pollUntilDone();

    const text = result.content || "";

    // ===== SIMPLE GLOBAL PARSER =====
    const parseNumber = (t) => {
      if (!t) return NaN;
      let clean = t.replace(/[^0-9.,-]/g, "");

      if (clean.includes(",") && clean.includes(".")) {
        clean =
          clean.lastIndexOf(",") > clean.lastIndexOf(".")
            ? clean.replace(/\./g, "").replace(",", ".")
            : clean.replace(/,/g, "");
      } else if (clean.includes(",")) {
        clean = clean.replace(",", ".");
      }

      return parseFloat(clean);
    };

    let income = 0;
    let expenses = 0;

    text.split("\n").forEach((line) => {
      const num = parseNumber(line);
      if (isNaN(num)) return;

      if (num > 0) income += num;
      else expenses += Math.abs(num);
    });

    return res.status(200).json({
      income: Math.round(income),
      fixed: Math.round(expenses * 0.6),
      variable: Math.round(expenses * 0.4),
      status: income > 0 || expenses > 0 ? "success" : "manual_needed",
    });
  } catch (err) {
    console.error("ERROR:", err);

    return res.status(500).json({
      error: err.message || "Processing failed",
    });
  }
}
