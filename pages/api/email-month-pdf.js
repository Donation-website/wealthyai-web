import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import streamBuffers from "stream-buffers";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, text, title, meta } = req.body;

  const doc = new PDFDocument({ margin: 50 });
  const buffer = new streamBuffers.WritableStreamBuffer();
  doc.pipe(buffer);

  const logoPath = path.join(
    process.cwd(),
    "public/wealthyai/icons/generated.png"
  );
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 40, { width: 120 });
  }

  doc.moveDown(3);
  doc.fontSize(18).text(title || "WealthyAI · Monthly Briefing");
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("gray").text(meta || "");
  doc.moveDown();
  doc.fontSize(12).fillColor("black").text(text, { lineGap: 4 });
  doc.end();

  buffer.on("finish", async () => {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: "WealthyAI <no-reply@wealthyai.ai>",
      to: email,
      subject: "Your WealthyAI Monthly Briefing",
      text: "Attached is your monthly briefing.",
      attachments: [
        {
          filename: "wealthyai-monthly-briefing.pdf",
          content: buffer.getContents(),
        },
      ],
    });

    res.status(200).json({ ok: true });
  });
}
