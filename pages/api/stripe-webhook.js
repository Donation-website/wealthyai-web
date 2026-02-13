import { buffer } from "micro";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { generateAccessConfirmationPDF } from "../../lib/pdf/generateAccessConfirmation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

// --- E-MAIL KÜLDŐ FÜGGVÉNY (AZ EREDETI LOGIKÁD ALAPJÁN FRISSÍTVE) ---
async function sendPaymentConfirmationEmail({ to, priceId, amount, currency, date, sessionId }) {
  console.log(`📧 E-mail küldés indítása: ${to}`);
  
  try {
    const productName = "WealthyAI Intelligence Pass";
    
    // 1. PDF Generálás indítása (sessionId-val kiegészítve)
    console.log("📄 PDF generálás folyamatban...");
    const pdfBuffer = await generateAccessConfirmationPDF({
      productName, amount, currency, date, sessionId
    });
    console.log("✅ PDF sikeresen legyártva, méret:", pdfBuffer.length);

    // 2. Transporter beállítása (PONTOSAN A TE BEÁLLÍTÁSAID)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000, 
    });

    // 3. Tényleges küldés
    console.log("🚀 Levél feladása az SMTP szervernek...");
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: `[CONFIDENTIAL] WealthyAI · Access Activated`,
      // Megtartjuk az eredeti text-et is fallback-nek
      text: `Welcome to the inner circle. Your access is now live. Your Access Key: ${sessionId}`,
      // De küldünk szép HTML-t is az instrukciókkal
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px;">
          <h2 style="color: #0f172a;">Welcome to the inner circle.</h2>
          <p>Your access is now live and your payment was successful.</p>
          
          <div style="background: #f8fafc; border: 1px solid #6366f1; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin-top: 0; font-weight: bold; color: #6366f1; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;">Your Priority Access Key</p>
            <code style="display: block; background: #fff; padding: 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 14px; word-break: break-all; font-family: monospace; color: #1e293b;">
              ${sessionId}
            </code>
          </div>

          <h3 style="font-size: 16px;">How to resume your session:</h3>
          <ol style="padding-left: 20px;">
            <li>Keep this email for the duration of your access.</li>
            <li>If you close your browser, return to <b>WealthyAI</b>.</li>
            <li>Click <b>"HAVE A PRIORITY CODE?"</b> on the dashboard.</li>
            <li>Paste the <b>Access Key</b> fenti kódját a session visszaállításához.</li>
          </ol>

          <p style="font-size: 12px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            The activation confirmation is also attached as a PDF.
          </p>
        </div>
      `,
      attachments: [{ filename: 'wealthyai-access.pdf', content: pdfBuffer }],
    });

    console.log("✨ E-mail sikeresen elküldve! MessageID:", info.messageId);
  } catch (err) {
    console.error('❌ KRITIKUS HIBA AZ E-MAIL FOLYAMATBAN:', err.message);
    throw err; 
  }
}

// --- WEBHOOK HANDLER ---
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      await sendPaymentConfirmationEmail({
        to: session.customer_details.email,
        priceId: session.metadata?.priceId || "unknown",
        amount: session.amount_total / 100,
        currency: session.currency.toUpperCase(),
        date: new Date().toLocaleDateString(),
        sessionId: session.id, 
      });

      console.log(`✅ Sikeres feldolgozás: ${session.id}`);
    } catch (err) {
      console.error(`❌ Hiba a feldolgozás során: ${err.message}`);
      // Nem küldünk 500-at, hogy a Stripe ne próbálja újra végtelenül, ha az e-mail hibás, 
      // de a logban ott lesz a hiba.
      return res.status(200).json({ error: "Email delivery failed, but session completed" });
    }
  }

  res.json({ received: true });
}
