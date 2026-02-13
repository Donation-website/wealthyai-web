import { buffer } from "micro";
import Stripe from "stripe";
import nodemailer from "nodemailer";
// Itt importáld a PDF generáló függvényedet (feltételezve, hogy egy külön fájlban van vagy alább definiálva)
// import { generateAccessConfirmationPDF } from "../../lib/pdf-helper"; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false, // Stripe webhookhoz kötelező kikapcsolni
  },
};

// E-mail küldő függvény
async function sendPaymentConfirmationEmail({ to, priceId, amount, currency, date }) {
  console.log(`📧 E-mail küldés indítása: ${to}`);
  try {
    const productName = "WealthyAI Intelligence Pass";
    console.log("📄 PDF generálás folyamatban...");
    
    // Itt hívjuk a PDF generálót
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

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: `[CONFIDENTIAL] WealthyAI · Access Activated`,
      text: "Welcome to the inner circle. Your access is now live. Note: This is a one-time access pass for the selected period.",
      attachments: [{ filename: 'wealthyai-access.pdf', content: pdfBuffer }],
    });

    console.log("✨ E-mail sikeresen elküldve!");
  } catch (err) {
    console.error('❌ E-MAIL HIBA:', err.message);
    throw err;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error(`❌ Webhook hiba: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // SIKERES FIZETÉS KEZELÉSE
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const subscriptionId = session.subscription;

    console.log(`💰 Sikeres fizetés: ${session.id}`);

    // 1. ELŐFIZETÉS AZONNALI LEÁLLÍTÁSA (Hogy ne legyen több levonás)
    if (subscriptionId) {
      try {
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
        console.log(`✅ Előfizetés leállítva a periódus végével: ${subscriptionId}`);
      } catch (err) {
        console.error(`❌ Hiba az előfizetés leállításakor: ${err.message}`);
      }
    }

    // 2. E-MAIL ÉS PDF KÜLDÉSE
    try {
      await sendPaymentConfirmationEmail({
        to: session.customer_details.email,
        priceId: session.metadata?.priceId,
        amount: session.amount_total / 100,
        currency: session.currency,
        date: new Date().toLocaleDateString('hu-HU'),
      });
    } catch (mailErr) {
      console.error("❌ E-mail küldési hiba a webhookban:", mailErr.message);
    }
  }

  return res.status(200).json({ received: true });
}
