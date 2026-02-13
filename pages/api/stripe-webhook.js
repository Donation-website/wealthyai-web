// Részlet az api/webhook.js-ből - Frissített sendPaymentConfirmationEmail
async function sendPaymentConfirmationEmail({ to, priceId, amount, currency, date }) {
  console.log(`📧 E-mail küldés indítása: ${to}`);
  
  try {
    const productName = "WealthyAI Intelligence Pass";
    
    // 1. PDF Generálás indítása
    console.log("📄 PDF generálás folyamatban...");
    const pdfBuffer = await generateAccessConfirmationPDF({
      productName, amount, currency, date,
    });
    console.log("✅ PDF sikeresen legyártva, méret:", pdfBuffer.length);

    // 2. Transporter beállítása
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000, // 10 mp timeout
    });

    // 3. Tényleges küldés
    console.log("🚀 Levél feladása az SMTP szervernek...");
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: `[CONFIDENTIAL] WealthyAI · Access Activated`,
      text: "Welcome to the inner circle. Your access is now live.",
      attachments: [{ filename: 'wealthyai-access.pdf', content: pdfBuffer }],
    });

    console.log("✨ E-mail sikeresen elküldve! MessageID:", info.messageId);
  } catch (err) {
    console.error('❌ KRITIKUS HIBA AZ E-MAIL FOLYAMATBAN:', err.message);
    throw err; // Visszadobjuk, hogy a webhook logjában látszódjon
  }
}
