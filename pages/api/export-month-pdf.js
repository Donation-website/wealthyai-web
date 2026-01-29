export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  try {
    const { text, title, meta } = req.body;

    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=wealthyai-monthly-briefing.pdf"
    );

    doc.pipe(res);

    const logoPath = path.join(
      process.cwd(),
      "public/wealthyai/icons/generated.png"
    );

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 40, { width: 120 });
    }

    doc.moveDown(3);
    doc.fontSize(18).text(
      title || "WealthyAI · Monthly Briefing",
      { align: "left" }
    );

    if (meta) {
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("gray").text(meta);
      doc.fillColor("black");
    }

    doc.moveDown();
    doc.fontSize(12).text(text || "", {
      lineGap: 4,
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PDF generation failed" });
  }
}
