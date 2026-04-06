import Admin from '../models/admin.model.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

// @desc    Admin Login
// @route   POST /api/admin/login
export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const admin = await Admin.findOne({ username });

    if (admin && (await admin.matchPassword(password))) {
      const accessToken = generateAccessToken(admin._id);
      const refreshToken = generateRefreshToken(admin._id);

      admin.refreshToken = refreshToken;
      await admin.save();

      res.status(200).json({
        accessToken,
        refreshToken,
        admin: {
          id: admin._id,
          username: admin.username,
          role: admin.role,
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin Logout
// @route   POST /api/admin/logout
export const logoutAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id);
    if (admin) {
      admin.refreshToken = undefined;
      await admin.save();
    }
    res.status(200).json({ message: 'Admin logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
