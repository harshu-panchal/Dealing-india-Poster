import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      req.user = await User.findById(decoded.id).select('-refreshToken');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.warn(`\x1b[33m[AUTH ERROR]: JWT Expired at ${error.expiredAt}\x1b[0m`);
        return res.status(401).json({ message: 'Session expired. Please log in again.' });
      }
      console.error('\x1b[31m[AUTH ERROR]:\x1b[0m', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};
