import User from '../models/user.model.js';
import OTP from '../models/otp.model.js';
import * as otpService from '../services/otp.service.js';
import { sendOTPEmail } from '../services/mail.service.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

// @desc    Send OTP to email/mobile
// @route   POST /api/user/send-otp
export const sendOTP = async (req, res) => {
  const { mobileNumber, email } = req.body;

  if (!mobileNumber && !email) {
    return res.status(400).json({ message: 'Mobile number or email is required' });
  }

  const identifier = mobileNumber || email;
  const type = mobileNumber ? 'mobile' : 'email';

  try {
    const otp = otpService.generateOTP();
    const hashedOtp = await otpService.hashOTP(otp);

    await otpService.saveOTP(identifier, hashedOtp, type);

    // 📬 REAL EMAIL INTEGRATION (If identifier is an email)
    if (type === 'email') {
        try {
            await sendOTPEmail(identifier, otp);
        } catch (mailErr) {
            console.error('Email failed but terminal shows OTP:', otp);
            // Fallback for dev: log it if email fails
        }
    }

    // Always log to terminal for developer reference
    console.log(`\n\x1b[33m[OTP SENT to ${identifier}] : ${otp}\x1b[0m\n`);

    res.status(200).json({ message: `OTP sent successfully to your ${type}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and Login/Register
// @route   POST /api/user/verify-otp
export const verifyOTP = async (req, res) => {
  const { mobileNumber, email, otp } = req.body;

  if ((!mobileNumber && !email) || !otp) {
    return res.status(400).json({ message: 'Identity and OTP are required' });
  }

  const identifier = mobileNumber || email;

  try {
    const otpRecord = await OTP.findOne({ identifier });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    const isValid = await otpService.verifyHashedOTP(otp, otpRecord.otp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP is valid, now find/create user
    let user = await User.findOne({ $or: [{ mobileNumber }, { email }] });

    if (!user) {
      user = await User.create({
        mobileNumber: mobileNumber || undefined,
        email: email || undefined,
        isVerified: true,
      });
    } else {
      user.isVerified = true;
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    // Delete OTP after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        mobileNumber: user.mobileNumber,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout User
// @route   POST /api/user/logout
export const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update User Profile
// @route   PUT /api/user/profile
export const updateProfile = async (req, res) => {
  const { name, mobileNumber, email, profilePhoto, logo, contentLanguage } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 🕵️ Checking for uniqueness conflicts with OTHER users
    if (mobileNumber && mobileNumber !== user.mobileNumber) {
        const existingMobile = await User.findOne({ mobileNumber, _id: { $ne: user._id } });
        if (existingMobile) return res.status(400).json({ message: 'This mobile number is already linked to another account' });
    }

    if (email && email !== user.email) {
        const existingEmail = await User.findOne({ email, _id: { $ne: user._id } });
        if (existingEmail) return res.status(400).json({ message: 'This email is already linked to another account' });
    }

    // 🛡️ Apply Updates
    user.name = name || user.name;
    user.mobileNumber = mobileNumber || user.mobileNumber;
    user.email = email || user.email;
    user.profilePhoto = profilePhoto || user.profilePhoto;
    user.logo = logo || user.logo;
    user.contentLanguage = contentLanguage || user.contentLanguage;

    const updatedUser = await user.save();

    res.status(200).json({
      accessToken: generateAccessToken(updatedUser._id),
      refreshToken: updatedUser.refreshToken,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        mobileNumber: updatedUser.mobileNumber,
        email: updatedUser.email,
        profilePhoto: updatedUser.profilePhoto,
        logo: updatedUser.logo,
        contentLanguage: updatedUser.contentLanguage,
        isVerified: updatedUser.isVerified,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
        return res.status(400).json({ message: 'Details already in use by another account' });
    }
    res.status(500).json({ message: error.message });
  }
};
