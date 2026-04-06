import express from 'express';
import { loginAdmin, logoutAdmin } from '../controllers/admin.auth.controller.js';
import { protectAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/logout', protectAdmin, logoutAdmin);

export default router;
