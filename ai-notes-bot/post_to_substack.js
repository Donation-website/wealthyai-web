import fs from "fs";
import nodemailer from "nodemailer";
import path from "path";

const base = path.resolve("./ai-notes-bot");
const notePath = path.join(base, "current_note.txt");

const note = fs.readFileSync(notePath, "utf8");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SUBSTACK_EMAIL,
    pass: process.env.SUBSTACK_EMAIL_PASS
  }
});

await transporter.sendMail({
  from: `"Time & Interpretation" <${process.env.SUBSTACK_EMAIL}>`,
  to: "timeinterpretation@substack.com",
  subject: "",
  text: note
});

console.log("Note sent to Substack.");
