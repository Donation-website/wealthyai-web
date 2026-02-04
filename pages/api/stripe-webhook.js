import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { generateAccessConfirmationPDF } from '@/lib/pdf/generateAccessConfirmation';

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

// 📧 EMAIL KÜLDÉS (PDF már a külön modulból jön)
async function sendPaymentConfirmationEmail({
  to,
  productName,
  amount,
  currency,
  date,
}) {
  const pdfBuffer = await generateAccessConfirmationPDF({
    productName,
    amount,
    currency,
    date,
  });

  const smtpPort = Number(process.env.SMTP_PORT);
  const useSecure = smtpPort === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: useSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // 🔍 SMTP kapcsolat ellenőrzése
  await transporter.verify();
  console.log('✅ SMTP connection verified', {
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: useSecure,
    from: process.env.MAIL_FROM,
  });

  // 📧 EMAIL KÜLDÉS
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Your WealthyAI access is now active',
    text: 'Your WealthyAI access is confirmed. Please find the attached document for your records.',
    attachments: [
      {
        filename: 'wealthyai-access-confirmation.pdf',
        content: pdfBuffer,
      },
    ],
  });

  console.log('📧 Access confirmation email sent');
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

    // 🔒 MEGLÉVŐ ÜZLETI LOGIKA – VÁLTOZATLAN
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

    // 📧 ACCESS EMAIL (NEM KRITIKUS, DE FONTOS UX)
    try {
      const customerEmail = session.customer_details?.email;

      if (customerEmail) {
        await sendPaymentConfirmationEmail({
          to: customerEmail,
          productName: 'WealthyAI Monthly Pass',
          amount: (session.amount_total / 100).toFixed(2),
          currency: session.currency,
          date: new Date(session.created * 1000)
            .toISOString()
            .split('T')[0],
        });
      } else {
        console.log('⚠️ No customer email found in session');
      }
    } catch (err) {
      console.error('⚠️ Email/PDF failed (ignored):', err);
    }
  }

  // ⚠️ Stripe mindig 200-at kap
  res.status(200).json({ received: true });
}
