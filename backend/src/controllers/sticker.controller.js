import Sticker from '../models/sticker.model.js';

// @desc    Get all stickers (Public/User)
// @route   GET /api/user/stickers
export const getPublicStickers = async (req, res) => {
  try {
    const stickers = await Sticker.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(stickers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all stickers (Admin)
// @route   GET /api/admin/stickers
export const getAdminStickers = async (req, res) => {
  try {
    const stickers = await Sticker.find({}).sort({ createdAt: -1 });
    res.status(200).json(stickers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a sticker
// @route   POST /api/admin/stickers
export const createSticker = async (req, res) => {
  const { name, image } = req.body;
  try {
    const sticker = new Sticker({ name, image });
    const savedSticker = await sticker.save();
    res.status(201).json(savedSticker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a sticker
// @route   PUT /api/admin/stickers/:id
export const updateSticker = async (req, res) => {
  const { name, image, isActive } = req.body;
  try {
    const sticker = await Sticker.findById(req.params.id);
    if (!sticker) return res.status(404).json({ message: 'Sticker not found' });

    sticker.name = name || sticker.name;
    sticker.image = image || sticker.image;
    if (isActive !== undefined) sticker.isActive = isActive;

    const updatedSticker = await sticker.save();
    res.status(200).json(updatedSticker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a sticker
// @route   DELETE /api/admin/stickers/:id
export const deleteSticker = async (req, res) => {
  try {
    const sticker = await Sticker.findById(req.params.id);
    if (!sticker) return res.status(404).json({ message: 'Sticker not found' });

    await Sticker.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Sticker deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
