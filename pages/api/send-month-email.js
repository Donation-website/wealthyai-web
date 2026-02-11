export const config = { runtime: "nodejs" };

import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const timeout = setTimeout(() => {
    console.error("EMAIL TIMEOUT");
    if (!res.headersSent) {
       return res.status(500).json({ error: "Email timeout" });
    }
  }, 15000); // Kicsit emeltem a biztonság kedvéért

  try {
    // JAVÍTÁS: Kivesszük az email-t a body-ból
    const { text, cycleDay, region, email } = req.body;

    if (!text || !email) {
      clearTimeout(timeout);
      return res.status(400).json({ error: "No content or email address" });
    }

    /* ===== CREATE PDF BUFFER ===== */
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on("data", c => chunks.push(c));
    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);

        /* ===== SMTP TRANSPORT ===== */
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: Number(process.env.SMTP_PORT) === 465, // SSL támogatás
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          connectionTimeout: 10000,
        });

        await transporter.sendMail({
          from: process.env.MAIL_FROM,
          to: email, // JAVÍTÁS: Most már a felhasználó által beírt címre megy!
          subject: `Your WealthyAI Monthly Briefing - Day ${cycleDay}`,
          text: "Attached is your monthly WealthyAI briefing report.",
          attachments: [
            {
              filename: `wealthyai-briefing-day${cycleDay}.pdf`,
              content: pdfBuffer,
            },
          ],
        });

        clearTimeout(timeout);
        if (!res.headersSent) {
          return res.status(200).json({ ok: true });
        }
      } catch (mailErr) {
        console.error("SENDMAIL ERROR:", mailErr);
        clearTimeout(timeout);
        if (!res.headersSent) {
          return res.status(500).json({ error: "Send failed", details: mailErr.message });
        }
      }
    });

    /* ===== PDF CONTENT GENERATION ===== */
    const logoPath = path.join(process.cwd(), "public/wealthyai/icons/generated.png");

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width - doc.page.margins.right - 80, 40, { width: 80 });
    }

    doc.moveDown(3);
    doc.fontSize(20).text("WealthyAI");
    doc.fontSize(14).text("Monthly Strategic Briefing", { underline: true });
    doc.moveDown();
    
    doc.fontSize(10).fillColor("gray")
      .text(`Region: ${region}`);
    doc.text(`Cycle Day: ${cycleDay}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    
    doc.moveDown(2);
    doc.fontSize(11).fillColor("black").text(text, {
      align: 'justify',
      lineGap: 4
    });

    doc.end();
  } catch (err) {
    console.error("GENERAL ERROR:", err);
    clearTimeout(timeout);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal error" });
    }
  }
}
