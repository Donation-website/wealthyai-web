export const config = { runtime: "nodejs" };

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { text, cycleDay, region } = req.body;

  // Modern PDF beállítása
  const doc = new PDFDocument({ 
    margin: 50,
    size: 'A4' 
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=wealthyai-monthly-briefing.pdf"
  );

  doc.pipe(res);

  // --- STÍLUS ÉS LOGÓ ---
  const logoPath = path.join(
    process.cwd(),
    "public/wealthyai/icons/generated.png"
  );

  // Logó elhelyezése (kisebb és elegánsabb)
  if (fs.existsSync(logoPath)) {
    doc.image(
      logoPath,
      doc.page.width - doc.page.margins.right - 80,
      40,
      { width: 80 }
    );
  }

  // --- FEJLÉC ---
  doc
    .fontSize(22)
    .font('Helvetica-Bold')
    .text("WealthyAI", 50, 45);

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor("#64748b")
    .text("MONTHLY STRATEGIC BRIEFING", 50, 75);

  // Elválasztó vonal
  doc
    .moveTo(50, 100)
    .lineTo(doc.page.width - 50, 100)
    .lineWidth(0.5)
    .strokeColor("#e2e8f0")
    .stroke();

  doc.moveDown(4);

  // --- ADATOK ---
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor("#0f172a")
    .text(`REGION: `, { continued: true })
    .font('Helvetica')
    .text(region.toUpperCase());

  doc
    .font('Helvetica-Bold')
    .text(`CYCLE STATUS: `, { continued: true })
    .font('Helvetica')
    .text(`Day ${cycleDay} of 30`);

  doc.moveDown(2);

  // --- AI TARTALOM (AZ IGAZI ÉRTÉK) ---
  doc
    .fontSize(12)
    .fillColor("#1e293b")
    .font('Helvetica')
    .text(text, {
      align: "justify",
      lineGap: 5, // Jobb olvashatóság, mint az írógépnél
      paragraphGap: 10
    });

  // --- LÁBLÉC ---
  const bottomPos = doc.page.height - 70;
  doc
    .fontSize(8)
    .fillColor("#94a3b8")
    .text(
      "WealthyAI Strategic Intelligence · Strictly Confidential · Probabilistic Interpretation Framework",
      50,
      bottomPos,
      { align: "center", width: doc.page.width - 100 }
    );

  doc.end();
}
