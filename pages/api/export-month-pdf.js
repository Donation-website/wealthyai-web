export const config = { runtime: "nodejs" };

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { text, cycleDay, region } = req.body;

  const doc = new PDFDocument({ margin: 50 });

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
    doc.image(
      logoPath,
      doc.page.width - doc.page.margins.right - 120,
      doc.page.margins.top,
      { width: 120 }
    );
  }

  doc.moveDown(3);

  doc
    .fontSize(18)
    .text("WealthyAI · Monthly Briefing", { align: "left" });

  doc
    .fontSize(10)
    .fillColor("gray")
    .text(`Region: ${region} · Cycle day: ${cycleDay}`);
  
  doc.moveDown();

  doc
    .fontSize(12)
    .fillColor("black")
    .text(text, {
      align: "left",
      lineGap: 4,
    });

  doc.end();
}
