import Music from '../models/music.model.js';

// @desc    Get all music
// @route   GET /api/admin/music
export const getMusic = async (req, res) => {
  try {
    const music = await Music.find().sort({ createdAt: -1 });
    res.status(200).json(music);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new music
// @route   POST /api/admin/music
export const createMusic = async (req, res) => {
  try {
    const { title, artist, audioUrl, thumbnailUrl, category, duration } = req.body;

    const music = await Music.create({
      title,
      artist,
      audioUrl,
      thumbnailUrl,
      category,
      duration
    });

    res.status(201).json(music);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update music
// @route   PUT /api/admin/music/:id
export const updateMusic = async (req, res) => {
  try {
    const music = await Music.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!music) {
      return res.status(404).json({ message: 'Music not found' });
    }

    res.status(200).json(music);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete music
// @route   DELETE /api/admin/music/:id
export const deleteMusic = async (req, res) => {
  try {
    const music = await Music.findByIdAndDelete(req.params.id);

    if (!music) {
      return res.status(404).json({ message: 'Music not found' });
    }

    res.status(200).json({ message: 'Music removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
