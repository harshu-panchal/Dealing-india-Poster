import express from 'express';
import { sendOTP, verifyOTP, logoutUser, updateProfile, saveTemplate, getSavedTemplates, getPublicSettings, getProfile } from '../controllers/user.auth.controller.js';
import { getPublicEvents, getEventTemplates } from '../controllers/admin.event.controller.js';
import { getPublicCategories, getPublicTemplates, getWhatsNewContent } from '../controllers/user.category.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { getFrames } from '../controllers/frame.controller.js';
import { toggleLikeTemplate, getLikedTemplates, checkLikedStatus } from '../controllers/like.controller.js';

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/save-template', protect, saveTemplate);
router.get('/my-posters', protect, getSavedTemplates);
router.get('/settings', getPublicSettings);

// Like Routes
router.post('/templates/:id/like', protect, toggleLikeTemplate);
router.get('/templates/liked', protect, getLikedTemplates);
router.post('/templates/check-likes', protect, checkLikedStatus);

// Public Content Routes
router.get('/categories', getPublicCategories);
router.get('/templates', getPublicTemplates);
router.get('/whats-new', getWhatsNewContent);

// Event Routes
router.get('/events', getPublicEvents);
router.get('/events/:id/templates', getEventTemplates);
router.get('/frames', getFrames);

export default router;
