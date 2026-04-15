import User from '../models/user.model.js';
import OTP from '../models/otp.model.js';
import Settings from '../models/settings.model.js';
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

    // 📬 REAL EMAIL INTEGRATION (Temporarily commented out for Vercel/Render SMTP blocks)
    /*
    if (type === 'email') {
        try {
            await sendOTPEmail(identifier, otp);
        } catch (mailErr) {
            console.error('Email failed but terminal shows OTP:', otp);
        }
    }
    */

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
  const { mobileNumber, email, otp, referralCode } = req.body;

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
    const filter = {};
    if (mobileNumber) filter.mobileNumber = mobileNumber;
    if (email) filter.email = email;

    let user = await User.findOne(filter);
    let isNewUser = false;

    console.log(`[DEBUG]: Verifying OTP for identity: ${identifier}. isNew: ${!user}`);

    if (!user) {
      isNewUser = true;
      user = new User({
        mobileNumber: mobileNumber || undefined,
        email: email || undefined,
        isVerified: true,
      });

      // Handle Referral
      if (referralCode) {
        console.log(`[DEBUG]: Attempting referral validation for code: ${referralCode}`);
        const uppercaseCode = referralCode.toUpperCase().trim();
        const referrer = await User.findOne({ referralCode: uppercaseCode });
        
        if (!referrer) {
           console.log(`[DEBUG]: REFERRAL FAILED - No user found with code: ${uppercaseCode}`);
        } else {
          console.log(`[DEBUG]: Referrer found: ${referrer.name || 'Unnamed'} (${referrer._id})`);
          console.log(`[DEBUG]: Referrer Identifiers - Mobile: ${referrer.mobileNumber}, Email: ${referrer.email}`);
          console.log(`[DEBUG]: Current Registrant - Mobile: ${mobileNumber}, Email: ${email}`);
          
          const isSelfReferral = referrer.mobileNumber === mobileNumber || (email && referrer.email === email);
          
          if (!isSelfReferral) {
            console.log(`[DEBUG]: REFERRAL SUCCESS - Applying points...`);
            user.referredBy = referrer._id;
            
            const referralPointsSetting = await Settings.findOne({ key: 'referralPoints' });
            const pointsValue = referralPointsSetting ? referralPointsSetting.value : 10;
            const pointsToAdd = isNaN(parseInt(pointsValue)) ? 10 : parseInt(pointsValue);
            
            // Referrer gets points
            referrer.points = (Number(referrer.points) || 0) + pointsToAdd;
            referrer.referralCount = (Number(referrer.referralCount) || 0) + 1;
            
            // New user also gets points
            user.points = (Number(user.points) || 0) + pointsToAdd;
            
            await referrer.save();
            console.log(`[DEBUG]: Referrer awarded ${pointsToAdd} pts. Total: ${referrer.points}, Count: ${referrer.referralCount}`);
            console.log(`[DEBUG]: New user awarded ${pointsToAdd} pts. Total: ${user.points}`);
          } else {
            console.log(`[DEBUG]: REFERRAL REJECTED - Self-referral detected.`);
          }
        }
      }
      await user.save();
    } else {
      user.isVerified = true;
      // Ensure existing users get a referral code if they don't have one
      if (!user.referralCode) {
        const generateCode = () => 'DI' + Math.random().toString(36).substring(2, 9).toUpperCase();
        user.referralCode = generateCode();
        try {
          await user.save();
        } catch (e) {
          console.warn('[RETRY]: Referral code collision, retrying...');
          user.referralCode = generateCode();
          await user.save();
        }
      }
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
        name: user.name,
        mobileNumber: user.mobileNumber,
        email: user.email,
        profilePhoto: user.profilePhoto,
        logo: user.logo,
        contentLanguage: user.contentLanguage,
        website: user.website,
        businessName: user.businessName,
        isVerified: user.isVerified,
        referralCode: user.referralCode,
        points: Number(user.points) || 0,
        referralCount: Number(user.referralCount) || 0,
      },
    });
  } catch (error) {
    console.error(`[DEBUG ERROR]: verifyOTP failed:`, error);
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate referral code if missing (legacy users)
    if (!user.referralCode) {
      try {
        // Generate a more robust code
        const generateCode = () => {
          return 'DI' + Math.random().toString(36).substring(2, 9).toUpperCase();
        };
        user.referralCode = generateCode();
        try {
          await user.save();
        } catch (saveErr) {
          if (saveErr.code === 11000) {
            // Retry once on collision
            user.referralCode = generateCode();
            await user.save();
          } else {
            throw saveErr;
          }
        }
      } catch (saveErr) {
        console.error('[REFERRAL ERROR]: Failed to generate referral code during profile fetch:', saveErr);
      }
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        mobileNumber: user.mobileNumber,
        email: user.email,
        profilePhoto: user.profilePhoto,
        logo: user.logo,
        contentLanguage: user.contentLanguage,
        website: user.website,
        businessName: user.businessName,
        isVerified: user.isVerified,
        referralCode: user.referralCode,
        points: user.points || 0,
        referralCount: user.referralCount || 0,
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
  const { name, mobileNumber, email, profilePhoto, logo, contentLanguage, website, businessName } = req.body;

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
    user.website = website || user.website;
    user.businessName = businessName || user.businessName;

    // Ensure referral code exists
    if (!user.referralCode) {
      user.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

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
        website: updatedUser.website,
        businessName: updatedUser.businessName,
        isVerified: updatedUser.isVerified,
        referralCode: updatedUser.referralCode,
        points: updatedUser.points,
        referralCount: updatedUser.referralCount,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
        return res.status(400).json({ message: 'Details already in use by another account' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add template to user's saved history
// @route   POST /api/user/save-template
export const saveTemplate = async (req, res) => {
  const { templateId, customData } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Move existing to top if found, otherwise add new
    const existingIndex = user.savedTemplates.findIndex(
      (t) => t.templateId?.toString() === templateId
    );

    if (existingIndex > -1) {
        user.savedTemplates.splice(existingIndex, 1);
    }
    
    user.savedTemplates.unshift({ templateId, customData, savedAt: new Date() });

    if (user.savedTemplates.length > 50) {
        user.savedTemplates = user.savedTemplates.slice(0, 50);
    }
    
    await user.save();
    res.status(200).json({ message: 'Template saved to history', savedTemplates: user.savedTemplates });
  } catch (error) {
    console.error('Save template error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's saved template history
// @route   GET /api/user/my-posters
export const getSavedTemplates = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
        path: 'savedTemplates.templateId',
        match: { isActive: true }
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user.savedTemplates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public app settings
// @route   GET /api/user/settings
export const getPublicSettings = async (req, res) => {
  try {
    const referralPointsSetting = await Settings.findOne({ key: 'referralPoints' });
    const supportContact = await Settings.findOne({ key: 'supportContact' });
    const socialLinks = await Settings.findOne({ key: 'socialLinks' });
    
    res.status(200).json({
      referralPoints: referralPointsSetting ? parseInt(referralPointsSetting.value) : 10,
      supportContact: supportContact ? supportContact.value : {
        email: 'support@appzeto.com',
        phone: '+91 9111111111',
        whatsapp: '+91 9111111111',
        helpUrl: 'https://help.appzeto.com'
      },
      socialLinks: socialLinks ? socialLinks.value : {
        instagram: '',
        facebook: '',
        youtube: ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
