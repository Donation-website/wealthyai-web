export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  // TEMPORARILY DISABLED FOR BUILD SAFETY
  // PDF generation requires pdfkit, which is not available
  return res.status(200).json({
    ok: true,
    message: "PDF export temporarily disabled.",
  });
}
