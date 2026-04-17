import Settings from '../models/settings.model.js';
import User from '../models/user.model.js';

// @desc    Get all system settings
// @route   GET /api/admin/settings
export const getSystemSettings = async (req, res) => {
  try {
    const settings = await Settings.find({});
    // Convert array of settings to a clean object
    const settingsObj = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    res.status(200).json(settingsObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update system settings (bulk)
// @route   POST /api/admin/settings
export const updateSystemSettings = async (req, res) => {
  const settingsData = req.body;
  console.log('[SETTINGS UPDATE]: Received data keys:', Object.keys(settingsData));

  try {
    const updatePromises = Object.entries(settingsData).map(async ([key, value]) => {
      // Skip undefined or null to avoid validation errors if they aren't intended to be saved
      if (value === undefined || value === null) return null;
      
      console.log(`[SETTINGS UPDATE]: Saving ${key} with value type: ${Array.isArray(value) ? 'Array' : typeof value}`);
      if (Array.isArray(value)) console.log(`[SETTINGS UPDATE]: ${key} has ${value.length} items`);

      return await Settings.findOneAndUpdate(
        { key },
        { $set: { value } },
        { upsert: true, new: true, runValidators: true }
      );
    });

    await Promise.all(updatePromises);
    console.log('[SETTINGS UPDATE]: Success');
    res.status(200).json({ message: 'System settings updated successfully' });
  } catch (error) {
    console.error('[SETTINGS UPDATE ERROR]:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get referral points setting
// @route   GET /api/admin/settings/referral-points
export const getReferralPoints = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'referralPoints' });
    res.status(200).json({ value: setting ? setting.value : 10 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update referral points setting
// @route   POST /api/admin/settings/referral-points
export const updateReferralPoints = async (req, res) => {
  const { value } = req.body;
  if (value === undefined) {
    return res.status(400).json({ message: 'Value is required' });
  }

  try {
    let setting = await Settings.findOne({ key: 'referralPoints' });
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await Settings.create({
        key: 'referralPoints',
        value: value,
        description: 'Points awarded to referrer when a new user joins',
      });
    }
    res.status(200).json({ message: 'Referral points updated successfully', value: setting.value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top referrers
// @route   GET /api/admin/referrals/leaderboard
export const getReferralLeaderboard = async (req, res) => {
  try {
    const topReferrersRaw = await User.find({ referralCount: { $gt: 0 } })
      .sort({ referralCount: -1 })
      .limit(10)
      .select('name referralCode referralCount points');

    // Fetch referred users for each top referrer
    const leaderboard = await Promise.all(topReferrersRaw.map(async (advocate) => {
      const referredUsers = await User.find({ referredBy: advocate._id })
        .select('name mobileNumber email createdAt')
        .sort({ createdAt: -1 });
      
      return {
        ...advocate.toObject(),
        referredUsers
      };
    }));
    
    // Calculate total stats
    const totalReferrals = await User.countDocuments({ referredBy: { $ne: null } });
    const totalPointsResult = await User.aggregate([
      { $group: { _id: null, total: { $sum: { $ifNull: [ "$points", 0 ] } } } }
    ]);

    res.status(200).json({
      success: true,
      leaderboard,
      stats: {
        totalReferrals,
        totalPointsIssued: totalPointsResult[0]?.total || 0,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
