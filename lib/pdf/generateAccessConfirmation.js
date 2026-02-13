import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export async function generateAccessConfirmationPDF({ productName, amount, currency, date, sessionId }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // --- LOGÓ ---
      const logoPath = path.join(process.cwd(), 'public', 'wealthyai', 'icons', 'generated.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, doc.page.width - 130, 40, { width: 80 });
      }

      // --- FEJLÉC ---
      doc.y = 80; // Fix indítás, hogy ne legyen a lap tetején
      doc.font('Helvetica-Bold').fontSize(22).fillColor('#0f172a').text("ACCESS CONFIRMATION");
      doc.fontSize(10).font('Helvetica').fillColor('#64748b').text("WealthyAI Intelligence Ecosystem", { oblique: true });
      
      doc.moveDown(1);
      doc.rect(50, doc.y, 495, 1).fill('#e2e8f0'); 
      
      // --- TRANZAKCIÓS ADATOK ---
      doc.moveDown(2);
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#64748b').text("SUBSCRIPTION DETAILS", { characterSpacing: 1 });
      
      doc.moveDown(1);
      doc.fontSize(11).font('Helvetica').fillColor('#1e293b');
      doc.text(`Product: `, { continued: true }).font('Helvetica-Bold').text(productName);
      doc.font('Helvetica').text(`Date: `, { continued: true }).font('Helvetica-Bold').text(date);
      doc.font('Helvetica').text(`Amount: `, { continued: true }).font('Helvetica-Bold').text(`${amount} ${currency}`);

      // --- ACCESS KEY BLOKK (Korrekt pozicionálással) ---
      doc.moveDown(3);
      const currentY = doc.y;
      
      // Kék hátterű doboz
      doc.rect(50, currentY, 495, 60).fill('#f8fafc');
      doc.rect(50, currentY, 3, 60).fill('#6366f1'); // Bal oldali hangsúlyos csík
      
      doc.fillColor('#6366f1').font('Helvetica-Bold').fontSize(9).text("YOUR UNIQUE PRIORITY ACCESS KEY:", 70, currentY + 15);
      doc.fillColor('#0f172a').font('Courier-Bold').fontSize(10).text(`${sessionId}`, 70, currentY + 32);
      
      // Visszaállítjuk a kurzort a doboz alá
      doc.y = currentY + 80;
      doc.x = 50;

      // --- A WEALTHYAI MANIFESZTUM ---
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a').text("THE FRAMEWORK");
      doc.moveDown(0.8);
      doc.font('Helvetica').fontSize(9).fillColor('#334155').text(
        "WealthyAI was built around a different question: What happens if AI doesn’t advise — but interprets? Not faster decisions, not better predictions, but clearer thinking.\n\n" +
        "It is not financial advice. It is not forecasting. WealthyAI assumes that you remain responsible for decisions — it simply gives you a clearer frame to make them.\n\n" +
        "Our system rewards attention over speed. Context changes with time, and so does financial insight. We are here to support human judgment — quietly, over time.",
        { width: 450, align: 'justify', lineGap: 3 }
      );

      // --- LÁBJEGYZET ---
      doc.y = doc.page.height - 70;
      doc.fontSize(7).fillColor('#94a3b8')
         .text("This document is a technical confirmation of access activation and does not constitute a formal tax invoice. Official financial receipts are issued separately by Stripe.", {
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
