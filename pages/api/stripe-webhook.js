import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (chunk) => chunks.push(chunk));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

// 📄 PDF GENERÁLÁS BUFFERBE
function generatePaymentPDF({ productName, amount, currency, date }) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });

    doc.fontSize(20).text('WealthyAI', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text('Payment Confirmation', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12).text(`Product: ${productName}`);
    doc.text(`Amount paid: ${amount} ${currency.toUpperCase()}`);
    doc.text(`Payment date: ${date}`);

    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor('gray')
      .text(
        'This document is not a tax invoice.\nOfficial payment receipt is provided by Stripe.'
      );

    doc.end();
  });
}

// 📧 EMAIL KÜLDÉS
async function sendPaymentConfirmationEmail({
  to,
  productName,
  amount,
  currency,
  date,
}) {
  const pdfBuffer = await generatePaymentPDF({
    productName,
    amount,
    currency,
    date,
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Your WealthyAI purchase confirmation',
    text: 'Thank you for your purchase. Please find your confirmation attached.',
    attachments: [
      {
        filename: 'wealthyai-payment-confirmation.pdf',
        content: pdfBuffer,
      },
    ],
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // 🔒 MEGLÉVŐ ÜZLETI LOGIKA – NEM VÁLTOZIK
    const priceId = session.metadata?.priceId;
    const subscriptionId = session.subscription;

    const MONTH_PRICE_ID = 'price_1SscbeDyLtejYlZixJcT3B4o';

    if (priceId === MONTH_PRICE_ID && subscriptionId) {
      try {
        await stripe.subscriptions.update(subscriptionId, {
          metadata: {
            had_month_before: 'true',
          },
        });
      } catch (err) {
        console.error('Subscription metadata update failed:', err);
      }
    }

    // 📧 UX EXTRA – EMAIL (NEM KRITIKUS)
    try {
      const customerEmail = session.customer_details?.email;

      if (customerEmail) {
        await sendPaymentConfirmationEmail({
          to: customerEmail,
          productName: 'WealthyAI Monthly Pass',
          amount: (session.amount_total / 100).toFixed(2),
          currency: session.currency,
          date: new Date(session.created * 1000).toLocaleDateString(),
        });
      }
    } catch (err) {
      console.error('Email/PDF failed (ignored):', err);
    }
  }

  res.status(200).json({ received: true });
}
