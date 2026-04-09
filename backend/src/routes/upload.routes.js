import express from 'express';
import { uploadFile } from '../controllers/upload.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', upload.single('file'), uploadFile);

export default router;
