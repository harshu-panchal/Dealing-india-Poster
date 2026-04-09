import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';

// @desc    Admin login & get token
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    let admin = await Admin.findOne({ username });

    // Auto-create first admin if none exists (for dev convenience)
    if (!admin && username === 'admin') {
      admin = await Admin.create({ username, password: 'admin123' });
    }

    if (admin && (await admin.matchPassword(password))) {
      const token = jwt.sign({ id: admin._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '30d',
      });

      res.status(200).json({
        _id: admin._id,
        username: admin.username,
        role: admin.role,
        accessToken: token,
      });
    } else {
      res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    console.error('\x1b[31m[ADMIN LOGIN ERROR]:\x1b[0m', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin logout
// @route   POST /api/admin/logout
// @access  Private
export const logoutAdmin = async (req, res) => {
  res.status(200).json({ message: 'Admin logged out successfully' });
};
