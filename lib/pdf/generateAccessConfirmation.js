import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export async function generateAccessConfirmationPDF({ productName, amount, currency, date }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // --- LOGÓ (Jobb felső sarok) ---
      const logoPath = path.join(process.cwd(), 'public', 'wealthyai', 'icons', 'generated.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, doc.page.width - 130, 40, { width: 80 });
      }

      // --- FEJLÉC ---
      doc.moveDown(3);
      doc.font('Helvetica-Bold').fontSize(18).text("ACCESS CONFIRMATION");
      doc.fontSize(10).font('Helvetica').text("WealthyAI Intelligence Ecosystem", { oblique: true });
      
      doc.moveDown(2);
      doc.rect(50, doc.y, 495, 0.5).fill('#E0E0E0'); // Finom elválasztó vonal
      
      // --- TRANZAKCIÓS ADATOK ---
      doc.moveDown(2);
      doc.fontSize(10).fillColor('#666666').text("SUBSCRIPTION DETAILS");
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#000000');
      doc.text(`Product: ${productName}`);
      doc.text(`Date: ${date}`);
      doc.text(`Amount: ${amount} ${currency}`);

      // --- A WEALTHYAI MANIFESZTUM (Lényegre törve) ---
      doc.moveDown(3);
      doc.fontSize(10).font('Helvetica-Bold').text("THE FRAMEWORK");
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(9).fillColor('#333333').text(
        "WealthyAI was built around a different question: What happens if AI doesn’t advise — but interprets? Not faster decisions, not better predictions, but clearer thinking.\n\n" +
        "It is not financial advice. It is not forecasting. WealthyAI assumes that you remain responsible for decisions — it simply gives you a clearer frame to make them.\n\n" +
        "Our system rewards attention over speed. Context changes with time, and so does financial insight. We are here to support human judgment — quietly, over time.",
        { width: 450, align: 'justify', lineGap: 2 }
      );

      // --- JOGI APRÓBETŰ (Mini méret, szürke) ---
      doc.moveDown(5);
      doc.fontSize(7).fillColor('#999999')
         .text("This document is a technical confirmation of access activation and does not constitute a formal tax invoice. Official financial receipts are issued separately by Stripe. This certificate cannot be used for accounting purposes.", {
           align: 'center',
           width: 495
         });

      doc.end();
    } catch (e) {
      console.error("PDF Gen error:", e);
      reject(e);
    }
  });
}
