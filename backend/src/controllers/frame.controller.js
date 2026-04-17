import Frame from '../models/frame.model.js';

// @desc    Create a new frame (Admin)
// @route   POST /api/admin/frames/create
export const createFrame = async (req, res) => {
  const { name, image, category, textStyle } = req.body;
  try {
    const frame = await Frame.create({
      name,
      image,
      category,
      textStyle,
    });
    res.status(201).json(frame);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active frames (User/Admin)
// @route   GET /api/frames
export const getFrames = async (req, res) => {
  try {
    const frames = await Frame.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(frames);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a frame (Admin)
// @route   PUT /api/admin/frames/:id
export const updateFrame = async (req, res) => {
  try {
    const frame = await Frame.findById(req.params.id);
    if (!frame) {
      return res.status(404).json({ message: 'Frame not found' });
    }
    const { name, image, category, textStyle } = req.body;
    if (name !== undefined) frame.name = name;
    if (image !== undefined) frame.image = image;
    if (category !== undefined) frame.category = category;
    if (textStyle !== undefined) frame.textStyle = textStyle;
    await frame.save();
    res.status(200).json(frame);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Soft delete a frame (Admin)
// @route   DELETE /api/admin/frames/:id
export const deleteFrame = async (req, res) => {
  try {
    const frame = await Frame.findById(req.params.id);
    if (!frame) {
      return res.status(404).json({ message: 'Frame not found' });
    }
    frame.isActive = false;
    await frame.save();
    res.status(200).json({ message: 'Frame deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
