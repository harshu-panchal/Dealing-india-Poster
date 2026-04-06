import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Dealing India Poster" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
        <h2 style="color: #ef4444; text-align: center;">Welcome to Dealing India Poster</h2>
        <p>Dear User,</p>
        <p>Your One-Time Password (OTP) for verification is:</p>
        <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 10px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #334155;">
          ${otp}
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #64748b;">This code is valid for 5 minutes. Please do not share it with anyone.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; 2026 Dealing India Poster. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`\x1b[32m✔ Email Sent Successfully to: ${email}\x1b[0m`);
    return info;
  } catch (error) {
    console.error(`\x1b[31m✘ CRITICAL EMAIL ERROR: ${error.message}\x1b[0m`);
    if (error.message.includes('Invalid login')) {
       console.log('\x1b[33m💡 Fix: Your Gmail or App Password in .env is incorrect!\x1b[0m');
    }
    throw new Error('Failed to send email OTP');
  }
};
