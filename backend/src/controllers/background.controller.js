import Background from '../models/background.model.js';

// Admin Controllers
export const getAdminBackgrounds = async (req, res) => {
  try {
    const backgrounds = await Background.find().sort({ createdAt: -1 });
    res.json(backgrounds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBackground = async (req, res) => {
  try {
    const { image } = req.body;
    const background = await Background.create({ image });
    res.status(201).json(background);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateBackground = async (req, res) => {
  try {
    const { id } = req.params;
    const { image, isActive } = req.body;
    const background = await Background.findByIdAndUpdate(
      id,
      { image, isActive },
      { new: true }
    );
    if (!background) return res.status(404).json({ message: 'Background not found' });
    res.json(background);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBackground = async (req, res) => {
  try {
    const { id } = req.params;
    const background = await Background.findByIdAndDelete(id);
    if (!background) return res.status(404).json({ message: 'Background not found' });
    res.json({ message: 'Background deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User Controllers
export const getUserBackgrounds = async (req, res) => {
  try {
    const backgrounds = await Background.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(backgrounds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
