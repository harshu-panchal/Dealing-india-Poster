import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    mobileNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
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
    gstNumber: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    agreedToPolicies: {
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
    fcmTokens: {
      type: [String],
      default: []
    },
    fcmTokenMobile: {
      type: [String],
      default: []
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware for referral code and field cleanup
userSchema.pre('save', async function () {
  // Ensure empty strings/nulls are treated as undefined for sparse unique index
  if (this.email === null || this.email === "") this.email = undefined;
  if (this.mobileNumber === null || this.mobileNumber === "") this.mobileNumber = undefined;

  if (!this.referralCode) {
    // Generate a simple referral code based on name or random string
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.referralCode = randomStr;
  }
});

const User = mongoose.model('User', userSchema);
export default User;
