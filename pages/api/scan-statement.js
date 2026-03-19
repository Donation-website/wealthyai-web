import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import formidable from "formidable";
import fs from "fs";

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
    // ===== FILE PARSE (STABIL) =====
    const form = formidable({
      multiples: false,
      maxFileSize: 5 * 1024 * 1024, // 5MB Vercel safe
    });

    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = files.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBuffer = fs.readFileSync(file.filepath);

    console.log("FILE SIZE:", fileBuffer.length);

    // ===== AZURE CLIENT =====
    const client = new DocumentAnalysisClient(
      endpoint,
      new AzureKeyCredential(key)
    );

    const poller = await client.beginAnalyzeDocument(
      "prebuilt-layout",
      fileBuffer,
      {
        contentType: file.mimetype || "application/pdf",
      }
    );

    const result = await poller.pollUntilDone();

    if (!result) {
      return res.status(500).json({ error: "No result from Azure" });
    }

    const text = result.content || "";

    console.log("TEXT LENGTH:", text.length);

    // ===== SMART PARSER (NEMZETKÖZI) =====

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

    const lines = text.split("\n");

    lines.forEach((line) => {
      const lower = line.toLowerCase();
      const num = parseNumber(line);

      if (isNaN(num)) return;

      // 🌍 INTERNATIONAL LOGIC (nem csak HU!)
      if (
        lower.includes("salary") ||
        lower.includes("income") ||
        lower.includes("credit") ||
        lower.includes("deposit") ||
        lower.includes("payment received") ||
        lower.includes("jóváírás") ||
        lower.includes("bevétel")
      ) {
        income += Math.abs(num);
      } else if (
        lower.includes("debit") ||
        lower.includes("payment") ||
        lower.includes("purchase") ||
        lower.includes("withdrawal") ||
        lower.includes("kifizetés") ||
        lower.includes("kiadás")
      ) {
        expenses += Math.abs(num);
      }
    });

    // ===== FALLBACK (ha nincs kulcsszó) =====
    if (income === 0 && expenses === 0) {
      lines.forEach((line) => {
        const num = parseNumber(line);
        if (!isNaN(num)) {
          if (num > 0) income += num;
          else expenses += Math.abs(num);
        }
      });
    }

    console.log("INCOME:", income, "EXP:", expenses);

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
      error: err.message || "Processing error",
    });
  }
}
