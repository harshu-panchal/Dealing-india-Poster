import Like from '../models/like.model.js';
import Template from '../models/template.model.js';

// @desc    Toggle like on a template
// @route   POST /api/user/templates/:id/like
export const toggleLikeTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ userId, templateId: id });

    if (existingLike) {
      // Unlike
      await Like.deleteOne({ _id: existingLike._id });
      await Template.findByIdAndUpdate(id, { $inc: { likeCount: -1 } });
      return res.status(200).json({ liked: false, message: 'Unliked successfully' });
    } else {
      // Like
      await Like.create({ userId, templateId: id });
      await Template.findByIdAndUpdate(id, { $inc: { likeCount: 1 } });
      return res.status(200).json({ liked: true, message: 'Liked successfully' });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get templates liked by the user
// @route   GET /api/user/templates/liked
export const getLikedTemplates = async (req, res) => {
  try {
    const userId = req.user._id;
    const likedRelations = await Like.find({ userId }).populate('templateId');
    
    // Filter out if template was deleted
    const templates = likedRelations
      .filter(rel => rel.templateId)
      .map(rel => rel.templateId);

    res.status(200).json(templates);
  } catch (error) {
    console.error('Get liked templates error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if templates are liked by user (for batch display)
// @route   POST /api/user/templates/check-likes
export const checkLikedStatus = async (req, res) => {
  try {
    const { templateIds } = req.body;
    const userId = req.user._id;

    const likes = await Like.find({
      userId,
      templateId: { $in: templateIds }
    });

    const likedMap = {};
    likes.forEach(like => {
      likedMap[like.templateId.toString()] = true;
    });

    res.status(200).json(likedMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
