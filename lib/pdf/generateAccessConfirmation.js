import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export async function generateAccessConfirmationPDF({ productName, amount, currency, date }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // --- SÖTÉT PRÉMIUM HÁTTÉR ---
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#05050A');
      
      // Arany keretek
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(1).stroke('#D4AF37');
      doc.rect(26, 26, doc.page.width - 52, doc.page.height - 52).lineWidth(0.5).stroke('#D4AF37');

      // --- LOGO BEILLESZTÉSE ---
      try {
        // Kipróbáljuk a pontos elérési utat
        const logoPath = path.join(process.cwd(), 'public', 'wealthyai', 'icons', 'generated.png');
        
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, (doc.page.width / 2) - 40, 60, { width: 80 });
        } else {
          console.warn("Logo not found at:", logoPath);
          // Ha nem találja, teszünk egy stílusos "W" betűt vagy kihagyjuk
        }
      } catch (imgErr) {
        console.error("Image loading failed but continuing...", imgErr);
      }

      // --- CÍMSOR ÉS SZÖVEG ---
      doc.moveDown(8);
      doc.font('Helvetica-Bold').fontSize(26).fillColor('#D4AF37').text("STRATEGIC ACCESS ACTIVATED", { align: 'center', charSpacing: 2 });
      
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(10).fillColor('#FFFFFF').text("WEALTHYAI INTELLIGENCE ECOSYSTEM", { align: 'center' });

      // ADATOK
      doc.moveDown(4);
      doc.fillColor('#D4AF37').fontSize(12).text("CLEARANCE DETAILS", 100);
      doc.fillColor('#FFFFFF').fontSize(14);
      doc.text(`Tier: ${productName}`, 100, doc.y + 12);
      doc.text(`Activation: ${date}`, 100, doc.y + 6);
      doc.text(`Transaction: ${amount} ${currency}`, 100, doc.y + 6);

      // AZ "OKOSSÁG"
      doc.moveDown(5);
      doc.font('Times-Italic').fontSize(13).fillColor('#D4AF37')
         .text('"Superiority is not about speed, but the quality of the framework you operate within."', { align: 'center' });

      doc.moveDown(2);
      doc.font('Helvetica').fontSize(10).fillColor('#A0A0A0')
         .text("Thank you for joining WealthyAI. We work to provide the best structural insights for your decision-making. In a world of noise, we provide the signal. Welcome to the circle of disciplined minds.", { align: 'center', width: 440 });

      // JOGI APRÓBETŰ (Fekete betűkkel a sötétszürkén, ahogy kérted)
      doc.fontSize(7).fillColor('#333333').text("--- LEGAL NOTICE ---", 50, doc.page.height - 80, { align: 'center' });
      doc.text("This document is a technical confirmation, not a tax invoice. Official receipts are issued by Stripe. Non-deductible for official accounting.", { align: 'center', width: 500 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
