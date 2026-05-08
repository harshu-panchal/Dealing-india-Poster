import express from 'express';
import { getPosterPreview } from '../controllers/share.controller.js';

const router = express.Router();

// @desc    Get dynamic poster preview for social sharing
// @route   GET /api/share/poster/:id
router.get('/poster/:id', getPosterPreview);

export default router;
