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
  priceId, // PriceId-t kapunk a felismeréshez
  amount,
  currency,
  date,
}) {
  // 1. DINAMIKUS CSOMAG NÉV MEGHATÁROZÁSA
  let productName = "WealthyAI Intelligence Pass";
  let packageType = "Strategic Intelligence Access";

  if (priceId === "price_1SscYJDyLtejYlZiyDvhdaIx") {
    productName = "WealthyAI 24h Daily Pass";
    packageType = "Daily Insight Framework";
  } else if (priceId === "price_1SscaYDyLtejYlZiDjSeF5Wm") {
    productName = "WealthyAI Weekly Strategic Pass";
    packageType = "Weekly Strategic Intelligence";
  } else if (priceId === "price_1SyaeRDyLtejYlZiWo76wuWO" || priceId === "price_1SscbeDyLtejYlZixJcT3B4o") {
    productName = "WealthyAI Full Monthly Pass";
    packageType = "Monthly Strategic Intelligence";
  }

  // PDF generálás az eredeti modullal
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

  // 📧 A FELTURBÓZOTT ANGOL SZÖVEG
  const mailText = `
[CONFIDENTIAL] WealthyAI · Strategy Session Activated

STATUS: ACCESS GRANTED
CLEARANCE: ${packageType.toUpperCase()}

Dear Partner,

Your transaction has been successfully verified. As of this moment, you have been granted full access to the WealthyAI Strategic Intelligence ecosystem for your selected period.

You have acquired more than just data; you have secured clarity. While most market participants operate amidst noise, you have chosen structured interpretation. This decision in itself reflects the disciplined mindset upon which the WealthyAI framework was built.

ACCESS DETAILS:
• Access Type: ${productName}
• Activation Date: ${date}
• Protocol: Stripe Secured Payment
• Intelligence Tier: Professional / High-Net-Worth Logic

YOUR NEXT STEP:
During your ${productName} period, we suggest focusing not on speed, but on structural connections. WealthyAI is designed not for prediction, but for probability-based, emotionless decision support.

"Strategic superiority begins where emotional reaction ends."

Note: Your access is now live. An official payment receipt is issued separately by Stripe for your accounting records.

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
          priceId: priceId, // Átadjuk a felismeréshez
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
