import express from 'express';
import { sendOTP, verifyOTP, logoutUser, updateProfile } from '../controllers/user.auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/logout', protect, logoutUser);
router.put('/profile', protect, updateProfile);

export default router;
