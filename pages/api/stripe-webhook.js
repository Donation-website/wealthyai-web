import Stripe from "stripe";
import nodemailer from "nodemailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// ✅ PDF generáló és E-mail küldő - benne a Session ID (Access Code)
async function sendPaymentConfirmationEmail({ to, priceId, amount, currency, date, sessionId }) {
  try {
    const productName = "WealthyAI Intelligence Pass";
    
    // PDF generálás - sessionId átadva a PDF-hez is
    const pdfBuffer = await generateAccessConfirmationPDF({ 
      productName, amount, currency, date, sessionId 
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: `[CONFIDENTIAL] WealthyAI · Access Activated`,
      // ✅ A szövegbe beletettük az Access Code-ot (Session ID)
      text: `Welcome to the inner circle. Your access is now live.\n\nYOUR ACCESS CODE: ${sessionId}\n\nIMPORTANT: Use this code to restore your access if you clear your browser or switch devices. Simply enter it into the "Priority/Access Code" field on the dashboard.`,
      attachments: [{ filename: 'wealthyai-access.pdf', content: pdfBuffer }],
    });
    console.log(`✨ E-mail sikeresen elküldve a kifizetett kódal: ${sessionId}`);
  } catch (err) {
    console.error('❌ E-MAIL HIBA:', err.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`❌ Webhook hiba: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const subscriptionId = session.subscription;

    // 1. Ismétlődő fizetés azonnali leállítása (hogy ne vonjon le többet)
    if (subscriptionId) {
      try {
        await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
        console.log(`✅ Előfizetés leállítva: ${subscriptionId}`);
      } catch (err) {
        console.error(`❌ Előfizetés leállítás hiba: ${err.message}`);
      }
    }

    // 2. Visszaigazolás küldése a SESSION ID-val
    await sendPaymentConfirmationEmail({
      to: session.customer_details.email,
      priceId: session.metadata?.priceId,
      amount: session.amount_total / 100,
      currency: session.currency,
      date: new Date().toLocaleDateString('hu-HU'),
      sessionId: session.id // Ez lesz a user belépőkódja
    });
  }

  res.status(200).json({ received: true });
}
