import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";

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
    return res.status(500).json({ error: "Missing Azure config" });
  }

  try {
    // ===== RAW BODY BEOLVASÁS (NO BUSBOY) =====
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    console.log("RAW SIZE:", buffer.length);

    // ===== BOUNDARY KINYERÉS =====
    const contentType = req.headers["content-type"] || "";
    const boundaryMatch = contentType.match(/boundary=(.+)$/);

    if (!boundaryMatch) {
      return res.status(400).json({ error: "No boundary found" });
    }

    const boundary = boundaryMatch[1];

    // ===== FILE KINYERÉS =====
    const parts = buffer.toString("binary").split(`--${boundary}`);

    let fileBuffer = null;

    for (let part of parts) {
      if (part.includes("filename=")) {
        const start = part.indexOf("\r\n\r\n") + 4;
        const end = part.lastIndexOf("\r\n");

        const fileBinary = part.substring(start, end);
        fileBuffer = Buffer.from(fileBinary, "binary");
        break;
      }
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ error: "File not found in request" });
    }

    console.log("FILE SIZE:", fileBuffer.length);

    // ===== AZURE =====
    const client = new DocumentAnalysisClient(
      endpoint,
      new AzureKeyCredential(key)
    );

    const poller = await client.beginAnalyzeDocument(
      "prebuilt-layout",
      fileBuffer,
      {
        contentType: "application/pdf",
      }
    );

    const result = await poller.pollUntilDone();

    const text = result?.content || "";

    console.log("TEXT LENGTH:", text.length);

    // ===== UNIVERSAL PARSER =====
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
      status:
        income > 0 || expenses > 0 ? "success" : "manual_needed",
    });

  } catch (err) {
    console.error("FULL ERROR:", err);

    return res.status(500).json({
      error: err.message || "Processing failed",
    });
  }
}
