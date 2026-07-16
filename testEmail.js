const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail(
  {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // send to yourself
    subject: "Test email",
    text: "If you see this, nodemailer works!",
  },
  (err, info) => {
    if (err) {
      console.error("FAILED:", err);
    } else {
      console.log("SUCCESS:", info.response);
    }
  }
);