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
    return res.status(500).json({ error: "Email timeout" });
  }, 10000);

  try {
    const { text, cycleDay, region } = req.body;

    if (!text) {
      clearTimeout(timeout);
      return res.status(400).json({ error: "No content" });
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
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 5000,
        });

        await transporter.sendMail({
          from: process.env.MAIL_FROM,
          to: process.env.MAIL_TO,
          subject: "Your WealthyAI Monthly Briefing",
          text: "Attached is your monthly WealthyAI briefing.",
          attachments: [
            {
              filename: "wealthyai-monthly-briefing.pdf",
              content: pdfBuffer,
            },
          ],
        });

        clearTimeout(timeout);
        return res.status(200).json({ ok: true });
      } catch (mailErr) {
        console.error("SENDMAIL ERROR:", mailErr);
        clearTimeout(timeout);
        return res.status(500).json({ error: "Send failed" });
      }
    });

    /* ===== PDF CONTENT ===== */
    const logoPath = path.join(
      process.cwd(),
      "public/wealthyai/icons/generated.png"
    );

    if (fs.existsSync(logoPath)) {
      doc.image(
        logoPath,
        doc.page.width - doc.page.margins.right - 120,
        doc.page.margins.top,
        { width: 120 }
      );
    }

    doc.moveDown(3);
    doc.fontSize(18).text("WealthyAI · Monthly Briefing");
    doc.fontSize(10).fillColor("gray")
      .text(`Region: ${region} · Cycle day: ${cycleDay}`);
    doc.moveDown();
    doc.fontSize(12).fillColor("black").text(text);

    doc.end();
  } catch (err) {
    console.error("GENERAL ERROR:", err);
    clearTimeout(timeout);
    return res.status(500).json({ error: "Internal error" });
  }
}
