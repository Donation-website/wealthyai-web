export const config = { runtime: "nodejs" };

import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const { text, cycleDay, region } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No content provided" });
    }

    /* ===== PDF GENERATION (IN MEMORY) ===== */
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);

      /* ===== SMTP TRANSPORT ===== */
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      /* ===== SEND EMAIL ===== */
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: process.env.MAIL_TO || process.env.SMTP_USER,
        subject: "Your WealthyAI Monthly Briefing",
        text: "Attached is your monthly WealthyAI briefing.",
        attachments: [
          {
            filename: "wealthyai-monthly-briefing.pdf",
            content: pdfBuffer,
          },
        ],
      });

      return res.status(200).json({ ok: true });
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

    doc
      .fontSize(18)
      .text("WealthyAI · Monthly Briefing", { align: "left" });

    doc
      .fontSize(10)
      .fillColor("gray")
      .text(`Region: ${region} · Cycle day: ${cycleDay}`);

    doc.moveDown();

    doc
      .fontSize(12)
      .fillColor("black")
      .text(text, {
        align: "left",
        lineGap: 4,
      });

    doc.end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Email sending failed" });
  }
}
