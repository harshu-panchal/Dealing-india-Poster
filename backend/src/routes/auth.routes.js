import express from 'express';
import { refreshAccessToken } from '../services/token.service.js';

const router = express.Router();

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh-token
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    const result = await refreshAccessToken(refreshToken);

    if (result) {
      res.status(200).json(result);
    } else {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
