import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text, title, meta } = req.body;

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
    doc.image(logoPath, 50, 40, { width: 120 });
  }

  doc.moveDown(3);
  doc.fontSize(18).text(title || "WealthyAI · Monthly Briefing");
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("gray").text(meta || "");
  doc.moveDown();
  doc.fontSize(12).fillColor("black").text(text, { lineGap: 4 });

  doc.end();
}
