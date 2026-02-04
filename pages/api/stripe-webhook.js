import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import pdf from 'html-pdf-node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false, // ⚠️ Stripe KÖTELEZŐ
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

// 📧 EMAIL + PDF (NON-CRITICAL, UX EXTRA)
async function sendPaymentConfirmationEmail({
  to,
  productName,
  amount,
  currency,
  date,
}) {
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <img src="https://wealthyai.ai/logo.png" width="120" />
        <h2>Thank you for choosing WealthyAI</h2>

        <p>You have successfully purchased:</p>

        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Amount paid:</strong> ${amount} ${currency.toUpperCase()}</p>
        <p><strong>Payment date:</strong> ${date}</p>

        <hr />
        <p style="font-size:12px;color:#666">
          This document is not a tax invoice.<br/>
          Official payment receipt is provided by Stripe.
        </p>
      </body>
    </html>
  `;

  const pdfBuffer = await pdf.generatePdf(
    { content: html },
    { format: 'A4' }
  );

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

    // ============================
    // ✅ MEGLÉVŐ ÜZLETI LOGIKA (NEM NYÚLUNK HOZZÁ)
    // ============================
    const priceId = session.metadata?.priceId;
    const subscriptionId = session.subscription;

    console.log('✅ PAYMENT CONFIRMED');
    console.log('Plan:', priceId);
    console.log('Subscription:', subscriptionId);

    const MONTH_PRICE_ID = 'price_1SscbeDyLtejYlZixJcT3B4o';

    if (priceId === MONTH_PRICE_ID && subscriptionId) {
      try {
        await stripe.subscriptions.update(subscriptionId, {
          metadata: {
            had_month_before: 'true',
          },
        });

        console.log('🧠 Month history saved to Stripe metadata');
      } catch (err) {
        console.error('❌ Failed to update subscription metadata:', err);
      }
    }

    // ============================
    // 📧 UX EXTRA – PAYMENT CONFIRMATION EMAIL (NON-CRITICAL)
    // ============================
    try {
      const customerEmail = session.customer_details?.email;
      const amount = (session.amount_total / 100).toFixed(2);
      const currency = session.currency;
      const productName = 'WealthyAI Monthly Pass';
      const date = new Date(session.created * 1000).toLocaleDateString();

      if (customerEmail) {
        await sendPaymentConfirmationEmail({
          to: customerEmail,
          productName,
          amount,
          currency,
          date,
        });

        console.log('📧 Payment confirmation email sent');
      }
    } catch (err) {
      console.error('⚠️ Email/PDF generation failed (ignored):', err);
    }
  }

  // ⚠️ STRIPE MINDIG 200-AT KAP
  res.status(200).json({ received: true });
}
