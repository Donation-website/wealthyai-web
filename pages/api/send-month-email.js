export const config = { runtime: "nodejs" };

import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  // Időkorlát beállítása (ha 15 mp alatt nem megy el, hiba)
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error("TIMEOUT REACHED");
      return res.status(504).json({ error: "Gateway Timeout - Email taking too long" });
    }
  }, 15000);

  try {
    const { text, cycleDay, region, email } = req.body;

    if (!text || !email) {
      clearTimeout(timeout);
      return res.status(400).json({ error: "Missing text or email" });
    }

    // --- 1. PDF GENERÁLÁS (PROMISE-BAN, HOGY MEGVÁRJA) ---
    const pdfBuffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // PDF Tartalom felépítése
      const logoPath = path.join(process.cwd(), "public/wealthyai/icons/generated.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, doc.page.width - 130, 40, { width: 80 });
      }

      doc.moveDown(3).fontSize(20).text("WealthyAI");
      doc.fontSize(14).text("Monthly Strategic Briefing", { underline: true });
      doc.moveDown();
      doc.fontSize(10).fillColor("gray")
         .text(`Region: ${region}`)
         .text(`Cycle Day: ${cycleDay}`)
         .text(`Date: ${new Date().toLocaleDateString()}`);
      
      doc.moveDown(2).fontSize(11).fillColor("black").text(text, {
        align: 'justify',
        lineGap: 4
      });

      doc.end();
    });

    // --- 2. SMTP KÜLDÉS ---
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

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: `Your WealthyAI Monthly Briefing - Day ${cycleDay}`,
      text: "Your monthly WealthyAI briefing report is attached.",
      attachments: [
        {
          filename: `wealthyai-briefing-day${cycleDay}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    clearTimeout(timeout);
    console.log(`✅ Email sent to ${email}`);
    return res.status(200).json({ ok: true });

  } catch (err) {
    clearTimeout(timeout);
    console.error("CRITICAL ERROR IN API:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  }
}
