const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

transporter.verify((err) => {
  if (err) console.error('SMTP verify failed:', err.message);
  else console.log('✅ SMTP ready via Brevo');
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"SaaS PM" <${process.env.BREVO_SENDER_EMAIL}>`,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
};

const sendOTPEmail = async (email, otp, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Email Verification</h2>
      <p>Hi ${name},</p>
      <p>Your OTP for email verification is:</p>
      <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <h1 style="color: #6366f1; letter-spacing: 8px; font-size: 36px;">${otp}</h1>
      </div>
      <p>This OTP expires in <strong>${process.env.OTP_EXPIRES_IN || 10} minutes</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Verify Your Email - SaaS PM', html });
};

const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Password Reset</h2>
      <p>Hi ${name},</p>
      <p>Click the button below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0;">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Password Reset - SaaS PM', html });
};

const sendTeamInviteEmail = async (email, inviterName, teamName, inviteUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Team Invitation</h2>
      <p><strong>${inviterName}</strong> has invited you to join <strong>${teamName}</strong> on SaaS PM.</p>
      <a href="${inviteUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0;">Accept Invitation</a>
      <p>This invitation expires in 7 days.</p>
    </div>
  `;
  return sendEmail({ to: email, subject: `You're invited to join ${teamName} - SaaS PM`, html });
};

module.exports = { sendEmail, sendOTPEmail, sendPasswordResetEmail, sendTeamInviteEmail };
