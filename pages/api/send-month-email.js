export const config = { runtime: "nodejs" };

import { EmailClient } from "@azure/communication-email";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error("TIMEOUT REACHED");
      return res.status(504).json({ error: "Gateway Timeout" });
    }
  }, 20000);

  try {
    const { text, cycleDay, region, email } = req.body;

    if (!text || !email) {
      clearTimeout(timeout);
      return res.status(400).json({ error: "Missing text or email" });
    }

    // ----- PDF GENERÁLÁS -----
    const pdfBuffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

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
        align: "justify",
        lineGap: 4,
      });

      doc.end();
    });

    // ----- AZURE EMAIL -----
    const client = new EmailClient(
      process.env.AZURE_COMMUNICATION_CONNECTION_STRING
    );

    const message = {
      senderAddress: process.env.MAIL_FROM,
      content: {
        subject: `Your WealthyAI Monthly Briefing - Day ${cycleDay}`,
        plainText: "Your monthly WealthyAI briefing report is attached.",
      },
      recipients: {
        to: [{ address: email }],
      },
      attachments: [
        {
          name: `wealthyai-briefing-day${cycleDay}.pdf`,
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

    clearTimeout(timeout);
    console.log("✅ Azure email sent to", email);
    return res.status(200).json({ ok: true });

  } catch (err) {
    clearTimeout(timeout);
    console.error("AZURE ERROR:", err);
    if (!res.headersSent) {
      return res.status(500).json({
        error: "Email sending failed",
        details: err.message,
      });
    }
  }
}
