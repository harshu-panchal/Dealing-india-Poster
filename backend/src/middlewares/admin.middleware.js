import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';

export const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      req.user = await Admin.findById(decoded.id).select('-password -refreshToken');

      if (!req.user || req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized as admin' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized as admin, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized as admin, no token' });
  }
};
