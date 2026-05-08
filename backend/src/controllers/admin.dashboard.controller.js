import User from '../models/user.model.js';
import Template from '../models/template.model.js';
import Category from '../models/category.model.js';
import Feedback from '../models/feedback.model.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [userCount, templateCount, categoryCount, feedbackCount, latestUsers, popularCategories] = await Promise.all([
      User.countDocuments(),
      Template.countDocuments(),
      Category.countDocuments(),
      Feedback.countDocuments(),
      User.find({}).sort({ createdAt: -1 }).limit(5),
      Template.aggregate([
        { $group: { _id: "$categoryId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 4 },
        { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "categoryInfo" } },
        { $unwind: "$categoryInfo" }
      ])
    ]);

    console.log('Dashboard Stats - Feedback Count:', feedbackCount);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers: userCount,
        activeTemplates: templateCount,
        totalCategories: categoryCount,
        totalFeedbacks: feedbackCount
      },
      popularCategories: popularCategories.map(c => ({
        name: c.categoryInfo.name,
        count: c.count,
        pct: templateCount > 0 ? Math.round((c.count / templateCount) * 100) : 0
      })),
      latestUsers: latestUsers.map(u => ({
        id: u._id,
        name: u.name || 'Unknown User',
        phone: u.mobileNumber || u.email || 'No contact',
        plan: 'Free',
        joined: u.createdAt,
        status: u.isVerified ? 'active' : 'inactive'
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSidebarAlerts = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [pendingFeedback, newUsers] = await Promise.all([
      Feedback.countDocuments({ status: 'pending' }),
      User.countDocuments({ createdAt: { $gte: twentyFourHoursAgo } })
    ]);

    res.status(200).json({
      success: true,
      alerts: {
        feedback: pendingFeedback,
        users: newUsers
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
