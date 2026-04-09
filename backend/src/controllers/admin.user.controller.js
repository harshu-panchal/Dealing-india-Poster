import User from '../models/user.model.js';

// @desc    Get all users for admin with pagination and search
// @route   GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { mobileNumber: searchRegex }
      ];
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      users,
      page,
      pages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
export const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.deleteOne();
    res.status(200).json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
