import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Admin from '../models/admin.model.js';
import { generateAccessToken } from '../utils/generateToken.js';

export const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

export const refreshAccessToken = async (refreshToken) => {
  const decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  if (!decoded) return null;

  // Check if it belongs to a user
  let account = await User.findOne({ _id: decoded.id, refreshToken });
  
  // If not user, check if it belongs to an admin
  if (!account) {
    account = await Admin.findOne({ _id: decoded.id, refreshToken });
  }

  if (!account) return null;

  return {
    accessToken: generateAccessToken(account._id),
    role: account.role || 'user'
  };
};
