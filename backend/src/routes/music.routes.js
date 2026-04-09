import express from 'express';
import { getMusic, createMusic, updateMusic, deleteMusic } from '../controllers/admin.music.controller.js';
import { protectAdmin } from '../middlewares/admin.middleware.js';
import Music from '../models/music.model.js';

const router = express.Router();

// Public route for user app
router.get('/public', async (req, res) => {
  try {
    const music = await Music.find().sort({ createdAt: -1 });
    res.status(200).json(music);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes
router.get('/', protectAdmin, getMusic);
router.post('/', protectAdmin, createMusic);
router.put('/:id', protectAdmin, updateMusic);
router.delete('/:id', protectAdmin, deleteMusic);

export default router;
