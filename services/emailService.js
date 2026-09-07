const nodemailer = require("nodemailer");

const sendVerificationEmail = async (toEmail, token) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const sendContactNotification = async (contact) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  await transporter.sendMail({ // reuse your existing transporter setup
    from: process.env.EMAIL_FROM,
    to: adminEmail,
    subject: `New Contact Form Submission: ${contact.subject}`,
    html: `
      <p><strong>From:</strong> ${contact.name} (${contact.email})</p>
      <p><strong>Subject:</strong> ${contact.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${contact.message}</p>
    `,
  });
};

module.exports = { sendVerificationEmail, sendContactNotification };

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"ShopEase" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your email",
    html: `
      <h2>Welcome to ShopEase!</h2>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `,
  });
};

module.exports = { sendVerificationEmail };