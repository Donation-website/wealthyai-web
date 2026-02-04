import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export function generateAccessConfirmationPDF({
  productName,
  amount,
  currency,
  date,
}) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
    });

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // ---- LOGO (diszkrét, bal felső) ----
    const logoPath = path.join(
      process.cwd(),
      'public/wealthyai/icons/generated.png'
    );

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 60, 50, { width: 120 });
    }

    // ---- FŐ CÍM ----
    doc
      .fontSize(20)
      .fillColor('#000000')
      .text('ACCESS CONFIRMATION', 60, 160, {
        align: 'center',
      });

    // ---- STÁTUSZ ----
    doc
      .moveDown(1)
      .fontSize(12)
      .fillColor('#000000')
      .text('Your WealthyAI subscription is active.', {
        align: 'center',
      });

    // ---- INFO BLOKK ----
    doc.moveDown(3);

    const labelX = 140;
    const valueX = 300;

    doc.fontSize(11).fillColor('#000000');

    doc.text('Product', labelX, doc.y);
    doc.text(productName, valueX, doc.y - 14);

    doc.moveDown(1.5);
    doc.text('Access starts', labelX, doc.y);
    doc.text(date, valueX, doc.y - 14);

    doc.moveDown(1.5);
    doc.text('Amount paid', labelX, doc.y);
    doc.text(`${amount} ${currency.toUpperCase()}`, valueX, doc.y - 14);

    doc.moveDown(1.5);
    doc.text('Payment', labelX, doc.y);
    doc.text('Card · Stripe', valueX, doc.y - 14);

    // ---- BRAND MESSAGE (OPTIKAILAG VALÓBAN KÖZÉPEN) ----
    doc.moveDown(4);

    doc
      .fontSize(11)
      .fillColor('#000000')
      .text(
        'Thank you for choosing WealthyAI.\n' +
          'You now have access to AI-driven insights designed for serious financial decision-making.',
        100,
        doc.y,
        {
          width: 400,
          align: 'center',
          lineGap: 4,
        }
      );

    // ---- ALSÓ KONCEPCIÓS STATEMENT (DISZKRÉT, NEM MARKETING) ----
    doc.moveDown(4);

    doc
      .fontSize(10)
      .fillColor('#444444')
      .text(
        'WealthyAI focuses on structured insights and probabilistic thinking\n' +
          'to support disciplined financial decision-making.',
        100,
        doc.y,
        {
          width: 400,
          align: 'center',
          lineGap: 3,
        }
      );

    // ---- FOOTER ----
    doc
      .fontSize(9)
      .fillColor('#666666')
      .text(
        'This document is not a tax invoice.\nOfficial payment receipt is issued by Stripe.',
        60,
        760,
        { align: 'center' }
      );

    doc.end();
  });
}
