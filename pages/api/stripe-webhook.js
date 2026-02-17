import Stripe from "stripe";
import { EmailClient } from "@azure/communication-email";
import { generateAccessConfirmationPDF } from "../../lib/pdf/generateAccessConfirmation";
import sql from "mssql";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// SQL Konfiguráció a Vercel-ben megadott környezeti változók alapján
const sqlConfig = {
    user: process.env.AZURE_SQL_USER,
    password: process.env.AZURE_SQL_PASSWORD,
    database: process.env.AZURE_SQL_DATABASE,
    server: process.env.AZURE_SQL_SERVER,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

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

// ÚJ FUNKCIÓ: Mentés az Azure SQL-be - semmit nem töröltünk, csak hozzáadtunk
async function saveSubscriptionToAzure(session) {
    try {
        let pool = await sql.connect(sqlConfig);
        
        // Alapértelmezett 31 napos lejárat
        let expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 31); 

        await pool.request()
            .input('session_id', sql.NVarChar, session.id)
            .input('email', sql.NVarChar, session.customer_details.email)
            .input('tier', sql.NVarChar, 'premium') 
            .input('expires_at', sql.DateTime, expiryDate)
            .query(`
                INSERT INTO subscriptions (stripe_session_id, email, tier, expires_at)
                VALUES (@session_id, @email, @tier, @expires_at)
            `);
        
        console.log("💾 SQL Adatmentés sikeresen megtörtént az Azure-ba.");
    } catch (err) {
        console.error("❌ SQL Hiba a mentési kísérlet során:", err.message);
        throw err;
    }
}

async function sendPaymentConfirmationEmail({ to, amount, currency, date, sessionId }) {
  console.log(`📧 Azure email küldés: ${to}`);

  const productName = "WealthyAI Intelligence Pass";

  // PDF generálás - EREDETI LOGIKA
  const pdfBuffer = await generateAccessConfirmationPDF({
    productName,
    amount,
    currency,
    date,
    sessionId,
  });

  const client = new EmailClient(
    process.env.AZURE_COMMUNICATION_CONNECTION_STRING
  );

  const message = {
    senderAddress: process.env.MAIL_FROM,
    content: {
      subject: "[CONFIDENTIAL] WealthyAI · Access Activated",
      plainText: `Welcome to the inner circle. Access Key: ${sessionId}

Copy and paste this Access Key on the start page to restore your session or to log in from another device.`,
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

          <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
            The activation confirmation is also attached as a PDF.
          </p>
        </div>
      `,
    },
    recipients: {
      to: [{ address: to }],
    },
    attachments: [
      {
        name: "wealthyai-access.pdf",
        contentType: "application/pdf",
        contentInBase64: pdfBuffer.toString("base64"),
      },
    ],
  };

  const poller = await client.beginSend(message);
  const result = await poller.pollUntilDone();

  if (result.status !== "Succeeded") {
    throw new Error("Azure email send failed");
  }

  console.log("✅ Azure payment confirmation email sent");
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).send("Method Not Allowed");

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // 1. LÉPÉS: SQL MENTÉS (A stabilitás miatt ez az első)
      await saveSubscriptionToAzure(session);

      // 2. LÉPÉS: EREDETI EMAIL KÜLDÉS ÉS PDF GENERÁLÁS
      await sendPaymentConfirmationEmail({
        to: session.customer_details.email,
        amount: session.amount_total / 100,
        currency: (session.currency || "USD").toUpperCase(),
        date: new Date().toLocaleDateString(),
        sessionId: session.id,
      });

      console.log(`✅ Feldolgozva és mentve: ${session.id}`);
    } catch (err) {
      console.error(`❌ Hiba a feldolgozás során: ${err.message}`);
      // Akkor is 200-at küldünk, ha az SQL/Email hiba volt, 
      // hogy a Stripe ne küldözgesse újra és újra
      return res.status(200).json({ error: "Processing error occurred but event received" });
    }
  }

  res.json({ received: true });
}
