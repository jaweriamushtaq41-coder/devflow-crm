const nodemailer = require('nodemailer');
const env = require('../config/env');

// Single shared transporter built from SMTP env vars (NodeMailer requirement
// from the U Devs official brief, section 3).
const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
});

async function sendMail({ to, subject, html }) {
  if (!env.smtp.host || !env.smtp.user) {
    // eslint-disable-next-line no-console
    console.warn('[email] SMTP not configured — skipping real send. Would have sent:', { to, subject });
    return { skipped: true };
  }
  return transporter.sendMail({ from: env.smtp.from, to, subject, html });
}

function verificationEmailTemplate({ name, verifyUrl }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
      <h2>Welcome to DevFlow CRM, ${name}!</h2>
      <p>Please verify your email address to activate your account.</p>
      <p><a href="${verifyUrl}" style="background:#0b5ed7;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Verify Email</a></p>
      <p>Or copy this link into your browser:<br/>${verifyUrl}</p>
      <p>This link expires in 24 hours.</p>
    </div>`;
}

function resetPasswordEmailTemplate({ name, resetUrl }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
      <h2>Password Reset Requested</h2>
      <p>Hi ${name}, click the button below to reset your DevFlow CRM password.</p>
      <p><a href="${resetUrl}" style="background:#0b5ed7;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Reset Password</a></p>
      <p>If you did not request this, you can safely ignore this email. This link expires in 1 hour.</p>
    </div>`;
}

module.exports = { sendMail, verificationEmailTemplate, resetPasswordEmailTemplate };
