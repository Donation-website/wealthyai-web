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

      // --- LOGÓ (Marad, mert ez korábban működött) ---
      const logoPath = path.join(process.cwd(), 'public', 'wealthyai', 'icons', 'generated.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, doc.page.width - 130, 40, { width: 80 });
      }

      // --- TARTALOM (Egyszerű, fehér háttér, profi betűk) ---
      doc.moveDown(4);
      doc.fontSize(22).text("STRATEGIC ACCESS ACTIVATED", { charSpacing: 1 });
      doc.fontSize(12).text("WealthyAI Intelligence Ecosystem", { oblique: true });
      
      doc.moveDown(2);
      doc.rect(doc.x, doc.y, 400, 1).fill('#000000'); // Egy egyszerű választóvonal
      
      doc.moveDown(2);
      doc.fontSize(14).fillColor('black');
      doc.text(`Intelligence Tier: ${productName}`);
      doc.text(`Activation Date: ${date}`);
      doc.text(`Transaction Amount: ${amount} ${currency}`);
      doc.text(`Protocol: SECURED BY STRIPE`);

      // AZ OKOSSÁG (Angolul)
      doc.moveDown(4);
      doc.fontSize(12).font('Times-Italic')
         .text('"Superiority is not about speed, but the quality of the framework you operate within."');

      doc.moveDown(2);
      doc.font('Helvetica').fontSize(10).fillColor('#333333')
         .text("Thank you for joining WealthyAI. We work to provide the best structural insights for your decision-making. In a world of noise, we provide the signal. Welcome to the circle of disciplined minds.", { width: 450 });

      // JOGI APRÓBETŰ (A legalján)
      doc.fontSize(8).fillColor('#888888')
         .text("--- LEGAL NOTICE ---", 50, doc.page.height - 80, { align: 'center' });
      doc.text("This document is a technical confirmation of access activation and does not constitute a formal tax invoice. Official financial receipts are issued separately by Stripe. This certificate cannot be used for accounting purposes.", {
        align: 'center',
        width: 500
      });

      doc.end();
    } catch (e) {
      console.error("PDF Generation failed:", e);
      reject(e);
    }
  });
}
