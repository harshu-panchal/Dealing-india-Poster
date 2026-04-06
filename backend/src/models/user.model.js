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
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
