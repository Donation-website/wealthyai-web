import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export async function generateAccessConfirmationPDF({ productName, amount, currency, date }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // --- PRÉMIUM DIZÁJN ---
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#05050A'); // Fekete háttér
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(1).stroke('#D4AF37'); // Arany keret

      // LOGÓ (Golyóálló módon)
      const logoPath = path.join(process.cwd(), 'public', 'wealthyai', 'icons', 'generated.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, (doc.page.width / 2) - 40, 60, { width: 80 });
      }

      doc.moveDown(8);
      doc.font('Helvetica-Bold').fontSize(26).fillColor('#D4AF37').text("STRATEGIC ACCESS ACTIVATED", { align: 'center' });
      
      doc.moveDown(2);
      doc.fillColor('#FFFFFF').fontSize(14).text(`Tier: ${productName}`, 120);
      doc.text(`Amount: ${amount} ${currency}`, 120);
      doc.text(`Date: ${date}`, 120);

      // AZ OKOSSÁG
      doc.moveDown(4);
      doc.font('Times-Italic').fontSize(12).fillColor('#D4AF37').text('"Strategy begins where emotion ends."', { align: 'center' });

      // JOGI APRÓBETŰ (Fekete betűkkel, hogy alig látsszon a sötétben, de ott legyen)
      doc.fontSize(7).fillColor('#222222').text("--- LEGAL NOTICE ---", 50, doc.page.height - 60, { align: 'center' });
      doc.text("Not a tax invoice. Official receipt issued by Stripe. Non-deductible for official accounting.", { align: 'center' });

      doc.end();
    } catch (e) { reject(e); }
  });
}
