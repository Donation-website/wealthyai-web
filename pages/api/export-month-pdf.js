export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  // TEMPORARILY DISABLED FOR BUILD SAFETY
  // Requires nodemailer + pdfkit + stream-buffers
  return res.status(200).json({
    ok: true,
    message: "Email PDF temporarily disabled.",
  });
}
