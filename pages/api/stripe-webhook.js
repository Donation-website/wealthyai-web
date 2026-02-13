import Stripe from "stripe";
import nodemailer from "nodemailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// ✅ Next.js beépített megoldás a nyers adatokhoz, nem kell hozzá 'micro'
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

async function sendPaymentConfirmationEmail({ to, priceId, amount, currency, date }) {
  try {
    const productName = "WealthyAI Intelligence Pass";
    // PDF generálás hívása (győződj meg róla, hogy a függvény létezik a fájlban vagy importálva van!)
    const pdfBuffer = await generateAccessConfirmationPDF({ productName, amount, currency, date });

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
      text: "Welcome to the inner circle. Your access is now live.",
      attachments: [{ filename: 'wealthyai-access.pdf', content: pdfBuffer }],
    });
    console.log("✨ E-mail elküldve.");
  } catch (err) {
    console.error('❌ E-mail hiba:', err.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const rawBody = await getRawBody(req); // 'micro' helyett ezt használjuk
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`❌ Webhook hiba: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const subscriptionId = session.subscription;

    // ✅ Azonnali leállítás, hogy ne vonjon le többet
    if (subscriptionId) {
      await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
    }

    await sendPaymentConfirmationEmail({
      to: session.customer_details.email,
      priceId: session.metadata?.priceId,
      amount: session.amount_total / 100,
      currency: session.currency,
      date: new Date().toLocaleDateString('hu-HU'),
    });
  }

  res.status(200).json({ received: true });
}
