import express from 'express';
import { sendOTP, verifyOTP, logoutUser, updateProfile, saveTemplate, getSavedTemplates } from '../controllers/user.auth.controller.js';
import { getPublicCategories, getPublicTemplates } from '../controllers/user.category.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/logout', protect, logoutUser);
router.put('/profile', protect, updateProfile);
router.post('/save-template', protect, saveTemplate);
router.get('/my-posters', protect, getSavedTemplates);

// Public Content Routes
router.get('/categories', getPublicCategories);
router.get('/templates', getPublicTemplates);

export default router;
