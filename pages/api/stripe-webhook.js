import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { generateAccessConfirmationPDF } from '../../lib/pdf/generateAccessConfirmation';

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

// 📧 DINAMIKUS ÉS PROFESSZIONÁLIS EMAIL KÜLDÉS
async function sendPaymentConfirmationEmail({
  to,
  priceId, 
  amount,
  currency,
  date,
}) {
  let productName = "WealthyAI Intelligence Pass";
  let packageType = "Strategic Intelligence Access";

  // ✅ JAVÍTOTT ÉLES (LIVE) ID-K ALAPJÁN TÖRTÉNŐ AZONOSÍTÁS
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
    productName,
    amount,
    currency,
    date,
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
[CONFIDENTIAL] WealthyAI · Strategy Session Activated

STATUS: ACCESS GRANTED
CLEARANCE: ${packageType.toUpperCase()}

Dear Partner,

Your transaction has been successfully verified. As of this moment, you have been granted full access to the WealthyAI Strategic Intelligence ecosystem for your selected period.

ACCESS DETAILS:
• Access Type: ${productName}
• Activation Date: ${date}
• Protocol: Stripe Secured Payment
• Intelligence Tier: Professional / High-Net-Worth Logic

YOUR NEXT STEP:
During your ${productName} period, we suggest focusing not on speed, but on structural connections. WealthyAI is designed not for prediction, but for probability-based, emotionless decision support.

"Strategic superiority begins where emotional reaction ends."

Welcome to the inner circle of disciplined minds.

WealthyAI Operations
Structured Insights · Probabilistic Thinking · Financial Clarity
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `[CONFIDENTIAL] WealthyAI · ${productName} Activated`,
    text: mailText,
    attachments: [
      {
        filename: 'wealthyai-access-confirmation.pdf',
        content: pdfBuffer,
      },
    ],
  });

  console.log(`📧 Access confirmation sent for: ${productName}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
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
        console.error('⚠️ High-level email failed:', err);
      }
    }
  }

  res.status(200).json({ received: true });
}
