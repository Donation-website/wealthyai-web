import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { generateAccessConfirmationPDF } from '../../lib/pdf/generateAccessConfirmation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false, // KRITIKUS a Stripe szignóhoz
  },
};

// Vercel-kompatibilis nyers adat beolvasó
async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// 📧 1. FUNKCIÓ: VÁSÁRLÁSI VISSZAIGAZOLÓ (Webhook hívja)
async function sendPaymentConfirmationEmail({ to, priceId, amount, currency, date }) {
  let productName = "WealthyAI Intelligence Pass";
  let packageType = "Strategic Intelligence Access";

  if (priceId === "price_1SsRVyDyLtejYlZi3fEwvTPW") {
    productName = "WealthyAI 24h Daily Pass";
    packageType = "Daily Insight Framework";
  } else if (priceId === "price_1SsRY1DyLtejYlZiglvFKufA") {
    productName = "WealthyAI Weekly Strategic Pass";
    packageType = "Weekly Strategic Intelligence";
  } else if (priceId === "price_1Sya6GDyLtejYlZiCb8oLqga") {
    productName = "WealthyAI Full Monthly Pass";
    packageType = "Monthly Strategic Intelligence";
  }

  const pdfBuffer = await generateAccessConfirmationPDF({
    productName, amount, currency, date,
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailText = `
[CONFIDENTIAL] WealthyAI · Access Activated
STATUS: ACCESS GRANTED
CLEARANCE: ${packageType.toUpperCase()}

Welcome to the inner circle. Your access is now live.
Detailed protocol is attached in the PDF.
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `[CONFIDENTIAL] WealthyAI · ${productName} Activated`,
    text: mailText,
    attachments: [{ filename: 'wealthyai-access.pdf', content: pdfBuffer }],
  });
}

// 🚀 WEBHOOK HANDLER
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;

  try {
    const buf = await getRawBody(req);
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const priceId = session.metadata?.priceId;
    const customerEmail = session.customer_details?.email;

    if (customerEmail) {
      try {
        await sendPaymentConfirmationEmail({
          to: customerEmail,
          priceId: priceId, 
          amount: (session.amount_total / 100).toFixed(2),
          currency: session.currency.toUpperCase(),
          date: new Date(session.created * 1000).toISOString().split('T')[0],
        });
      } catch (err) {
        console.error('⚠️ Webhook Email fail:', err);
      }
    }
  }

  res.status(200).json({ received: true });
}
