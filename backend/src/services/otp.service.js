import bcrypt from 'bcryptjs';
import OTP from '../models/otp.model.js';

export const generateOTP = () => {
  // return Math.floor(100000 + Math.random() * 900000).toString();
  return "123456"; // Dummy OTP for production preview (Vercel/Render block SMTP)
};

export const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(otp, salt);
};

export const saveOTP = async (identifier, hashedOtp, type) => {
  // Clear any existing OTP for this identifier
  await OTP.deleteMany({ identifier });

  return await OTP.create({
    identifier,
    otp: hashedOtp,
    type,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  });
};

export const verifyHashedOTP = async (otp, hashedOtp) => {
  return await bcrypt.compare(otp, hashedOtp);
};
