const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const nodemailer = require("nodemailer");

console.log("--- SMTP config being used ---");
console.log("HOST:", process.env.SMTP_HOST);
console.log("PORT:", process.env.SMTP_PORT);
console.log("USER:", process.env.SMTP_USER);
console.log(
  "PASS length:",
  (process.env.SMTP_PASS || "").length,
  "(should be 16 if app password, with no spaces)",
);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: (process.env.SMTP_PASS || "").replace(/\s+/g, ""),
  },
});

// Step 1: verify() just checks the connection + login, no email sent
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP verify FAILED:", err.message);
    console.error(err);
    process.exit(1);
  } else {
    console.log("✅ SMTP connection + login OK, now sending a test email...");

    transporter.sendMail(
      {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: process.env.SMTP_USER, // sends to yourself for the test
        subject: "StayEase SMTP Test",
        html: "<p>If you got this, your SMTP credentials work.</p>",
      },
      (err2, info) => {
        if (err2) {
          console.error("❌ sendMail FAILED:", err2.message);
          console.error(err2);
          process.exit(1);
        } else {
          console.log("✅ Email sent! messageId:", info.messageId);
          console.log("Response:", info.response);
          process.exit(0);
        }
      },
    );
  }
});
