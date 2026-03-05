export const config = { runtime: "nodejs" };

import { EmailClient } from "@azure/communication-email";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

const rateLimitStore = global.rateLimitStore || new Map();
global.rateLimitStore = rateLimitStore;

function checkRateLimit(ip) {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, firstRequest: now });
    return true;
  }
  const data = rateLimitStore.get(ip);
  if (now - data.firstRequest > hour) {
    rateLimitStore.set(ip, { count: 1, firstRequest: now });
    return true;
  }
  if (data.count >= 3) return false;
  data.count++;
  return true;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || "unknown";

  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait." });
  }

  // 25 másodpercre emelt timeout a biztonság kedvéért
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      return res.status(504).json({ error: "Gateway Timeout" });
    }
  }, 25000);

  try {
    const { text, cycleDay, region, email } = req.body;

    if (!text || !email) {
      clearTimeout(timeout);
      return res.status(400).json({ error: "Missing data" });
    }

    // ----- PDF GENERÁLÁS (STABILIZÁLVA) -----
    const pdfBuffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, autoFirstPage: true });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Logó kezelése
      const logoPath = path.join(process.cwd(), "public/wealthyai/icons/generated.png");
      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, doc.page.width - 130, 40, { width: 80 });
        } catch (e) { console.error("Logo error", e); }
      }

      doc.moveDown(3).fontSize(24).fillColor("#38bdf8").text("MyWealthyAI");
      doc.fontSize(14).fillColor("black").text("Monthly Strategic Briefing", { underline: true });
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

    if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error("PDF Buffer is empty");
    }

    // ----- AZURE EMAIL -----
    const client = new EmailClient(process.env.AZURE_COMMUNICATION_CONNECTION_STRING);

    const message = {
      senderAddress: process.env.MAIL_FROM,
      content: {
        subject: `MyWealthyAI Briefing - Day ${cycleDay}`,
        plainText: `Your MyWealthyAI monthly briefing for day ${cycleDay} is attached as a PDF.`,
      },
      recipients: {
        to: [{ address: email }],
      },
      attachments: [
        {
          name: "briefing.pdf", // Egyszerű név, nincsenek speciális karakterek
          contentType: "application/pdf",
          contentInBase64: pdfBuffer.toString("base64"),
        },
      ],
    };

    console.log(`Sending email to ${email}... PDF size: ${pdfBuffer.length} bytes`);
    
    const poller = await client.beginSend(message);
    const result = await poller.pollUntilDone();

    if (result.status === "Succeeded") {
      clearTimeout(timeout);
      console.log("✅ MyWealthyAI report sent successfully");
      return res.status(200).json({ ok: true });
    } else {
      throw new Error(`Azure status: ${result.status}`);
    }

  } catch (err) {
    clearTimeout(timeout);
    console.error("CRITICAL ERROR:", err.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to send email", details: err.message });
    }
  }
}
