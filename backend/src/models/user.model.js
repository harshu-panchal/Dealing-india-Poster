import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    mobileNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
    },
    profilePhoto: {
      type: String,
    },
    logo: {
      type: String,
    },
    contentLanguage: {
      type: String,
      default: 'English',
    },
    website: {
      type: String,
    },
    businessName: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    savedTemplates: [
      {
        templateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Template',
        },
        customData: {
          type: Object,
          default: {}
        },
        savedAt: {
          type: Date,
          default: Date.now
        }
      },
    ],
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (!this.referralCode) {
    // Generate a simple referral code based on name or random string
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.referralCode = randomStr;
  }
});

const User = mongoose.model('User', userSchema);
export default User;
