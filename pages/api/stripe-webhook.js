// Ezt a függvényt használd a webhook kezelőben, amikor a checkout.session.completed vagy 
// invoice.payment_succeeded esemény befut.
async function sendPaymentConfirmationEmail({ to, priceId, amount, currency, date }) {
  console.log(`📧 E-mail küldés indítása: ${to}`);
  
  try {
    const productName = "WealthyAI Intelligence Pass";
    
    // 1. PDF Generálás
    console.log("📄 PDF generálás folyamatban...");
    const pdfBuffer = await generateAccessConfirmationPDF({
      productName, amount, currency, date,
    });

    // 2. Transporter (SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 3. Küldés
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: `[CONFIDENTIAL] WealthyAI · Access Activated`,
      text: "Welcome to the inner circle. Your access is now live. Note: This is a one-time access pass for the selected period.",
      attachments: [{ filename: 'wealthyai-access.pdf', content: pdfBuffer }],
    });

    console.log("✨ E-mail sikeresen elküldve!");
  } catch (err) {
    console.error('❌ E-MAIL HIBA:', err.message);
    throw err;
  }
}
