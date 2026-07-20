const { Resend } = require("resend");

const sendVerificationEmail = async (toEmail, token) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
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