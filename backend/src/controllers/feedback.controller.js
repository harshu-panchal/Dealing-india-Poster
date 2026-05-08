import Feedback from '../models/feedback.model.js';
import User from '../models/user.model.js';

// @desc    Submit new feedback
// @route   POST /api/user/feedback
// @access  Private
export const submitFeedback = async (req, res) => {
  try {
    const { message, rating } = req.body;

    if (!message || !rating) {
      return res.status(400).json({ message: 'Please provide both message and rating' });
    }

    const feedback = await Feedback.create({
      user: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
      message,
      rating
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Get all feedbacks
// @route   GET /api/admin/feedbacks
// @access  Private/Admin
export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/admin/feedbacks/:id
// @access  Private/Admin
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Update feedback status
// @route   PUT /api/admin/feedbacks/:id/status
// @access  Private/Admin
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback status updated successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
