import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export async function generateAccessConfirmationPDF({ productName, amount, currency, date }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // --- DIZÁJN ELEMEK ---
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#05050A'); // Sötét háttér
    doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).lineWidth(1).stroke('#D4AF37'); // Arany keret

    // A TE LOGÓD BEHÚZÁSA
    const logoPath = path.join(process.cwd(), "public/wealthyai/icons/generated.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, (doc.page.width / 2) - 40, 60, { width: 80 });
    }

    doc.moveDown(7);
    doc.font('Helvetica-Bold').fontSize(26).fillColor('#D4AF37').text("STRATEGIC ACCESS ACTIVATED", { align: 'center' });
    
    doc.moveDown(1);
    doc.font('Helvetica').fontSize(10).fillColor('#FFFFFF').text("WEALTHYAI INTELLIGENCE ECOSYSTEM", { align: 'center' });

    // ADATOK
    doc.moveDown(3);
    doc.fillColor('#D4AF37').fontSize(12).text("CLEARANCE DETAILS", 120);
    doc.fillColor('#FFFFFF').fontSize(14);
    doc.text(`Tier: ${productName}`, 120, doc.y + 10);
    doc.text(`Activation: ${date}`, 120, doc.y + 5);
    doc.text(`Transaction: ${amount} ${currency}`, 120, doc.y + 5);

    // AZ "OKOSSÁG" (Angolul, ahogy kérted)
    doc.moveDown(4);
    doc.font('Times-Italic').fontSize(13).fillColor('#D4AF37')
       .text('"Superiority is not about speed, but the quality of the framework you operate within."', { align: 'center' });

    doc.moveDown(2);
    doc.font('Helvetica').fontSize(10).fillColor('#A0A0A0')
       .text("Thank you for joining WealthyAI. We work to provide the best structural insights for your decision-making. In a world of noise, we provide the signal. Welcome to the circle of disciplined minds.", { align: 'center', width: 450 });

    // APRÓBETŰS RÉSZ (Hogy ne legyen baj belőle)
    doc.fontSize(8).fillColor('#444444').text("--- LEGAL NOTICE ---", 50, doc.page.height - 70, { align: 'center' });
    doc.text("This is a technical confirmation, not a tax invoice. Official receipts are issued by Stripe. Non-deductible for official accounting.", { align: 'center', width: 500 });

    doc.end();
  });
}
