import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import User from '../models/user.model.js';
import { sendPushNotification } from '../services/firebase.service.js';

const router = express.Router();

// @desc    Save FCM Token
// @route   POST /api/fcm/tokens/save
// @access  Private
router.post('/tokens/save', protect, async (req, res) => {
    try {
        const { token, platform = 'web' } = req.body;
        const userId = req.user._id;

        console.log(`[DEBUG]: Saving FCM token for user: ${userId}, Platform: ${platform}`);

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Add token to appropriate array
        if (platform === 'web') {
            if (!user.fcmTokens) user.fcmTokens = [];
            if (!user.fcmTokens.includes(token)) {
                user.fcmTokens.push(token);
                // Keep only last 10 tokens
                if (user.fcmTokens.length > 10) {
                    user.fcmTokens = user.fcmTokens.slice(-10);
                }
            }
        } else if (platform === 'mobile') {
            if (!user.fcmTokenMobile) user.fcmTokenMobile = [];
            if (!user.fcmTokenMobile.includes(token)) {
                user.fcmTokenMobile.push(token);
                // Keep only last 10 tokens
                if (user.fcmTokenMobile.length > 10) {
                    user.fcmTokenMobile = user.fcmTokenMobile.slice(-10);
                }
            }
        }

        await user.save();
        res.json({ success: true, message: 'FCM token saved successfully' });
    } catch (error) {
        console.error('Error saving FCM token:', error);
        res.status(500).json({ error: 'Failed to save token' });
    }
});

// @desc    Remove FCM Token
// @route   DELETE /api/fcm/tokens/remove
// @access  Private
router.delete('/tokens/remove', protect, async (req, res) => {
    try {
        const { token, platform = 'web' } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (platform === 'web' && user.fcmTokens) {
            user.fcmTokens = user.fcmTokens.filter(t => t !== token);
        } else if (platform === 'mobile' && user.fcmTokenMobile) {
            user.fcmTokenMobile = user.fcmTokenMobile.filter(t => t !== token);
        }

        await user.save();
        res.json({ success: true, message: 'FCM token removed successfully' });
    } catch (error) {
        console.error('Error removing FCM token:', error);
        res.status(500).json({ error: 'Failed to remove token' });
    }
});

// @desc    Test Push Notification
// @route   POST /api/fcm/test
// @access  Private
router.post('/test', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        const tokens = [...(user.fcmTokens || []), ...(user.fcmTokenMobile || [])];
        const uniqueTokens = [...new Set(tokens)];

        if (uniqueTokens.length === 0) {
            return res.status(400).json({ error: 'No FCM tokens found for this user' });
        }

        await sendPushNotification(uniqueTokens, {
            title: 'Test Notification',
            body: 'This is a test notification from DealingIndia Poster app',
            data: {
                type: 'test',
                link: '/'
            }
        });

        res.json({ success: true, message: 'Test notification sent' });
    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
