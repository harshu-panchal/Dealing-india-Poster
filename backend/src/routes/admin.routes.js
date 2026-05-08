import express from 'express';
import { loginAdmin, logoutAdmin } from '../controllers/admin.auth.controller.js';
import { deleteUser, getUserDetail, getUsers } from '../controllers/admin.user.controller.js';
import { 
  createCategory, getCategories, updateCategory, deleteCategory,
  createSubcategory, updateSubcategory, deleteSubcategory 
} from '../controllers/admin.category.controller.js';
import { 
  getAdminTemplates, createTemplate, updateTemplate, deleteTemplate 
} from '../controllers/admin.template.controller.js';
import { getDashboardStats, getSidebarAlerts } from '../controllers/admin.dashboard.controller.js';
import { 
  getReferralPoints, updateReferralPoints, getReferralLeaderboard,
  getSystemSettings, updateSystemSettings 
} from '../controllers/admin.settings.controller.js';
import { 
  getAdminEvents, createEvent, updateEvent, deleteEvent 
} from '../controllers/admin.event.controller.js';
import { uploadFile } from '../controllers/upload.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { protectAdmin } from '../middlewares/admin.middleware.js';
import { createFrame, getFrames, deleteFrame, updateFrame } from '../controllers/frame.controller.js';
import { createSticker, getAdminStickers, updateSticker, deleteSticker } from '../controllers/sticker.controller.js';
import { createBackground, getAdminBackgrounds, updateBackground, deleteBackground } from '../controllers/background.controller.js';
import { getAllFeedbacks, deleteFeedback, updateFeedbackStatus } from '../controllers/feedback.controller.js';


const router = express.Router();

router.post('/login', loginAdmin);
router.post('/logout', protectAdmin, logoutAdmin);

// Settings Routes
router.get('/settings/referral-points', protectAdmin, getReferralPoints);
router.post('/settings/referral-points', protectAdmin, updateReferralPoints);

router.get('/settings', protectAdmin, getSystemSettings);
router.post('/settings', protectAdmin, updateSystemSettings);

// Protected Admin Routes
router.get('/users', protectAdmin, getUsers);
router.get('/dashboard-stats', protectAdmin, getDashboardStats);
router.get('/dashboard/sidebar-alerts', protectAdmin, getSidebarAlerts);
router.get('/users/:id', protectAdmin, getUserDetail);
router.delete('/users/:id', protectAdmin, deleteUser);

// Category Routes
router.route('/categories')
  .post(protectAdmin, createCategory)
  .get(protectAdmin, getCategories);

router.route('/categories/:id')
  .put(protectAdmin, updateCategory)
  .delete(protectAdmin, deleteCategory);

// Subcategory Routes
router.post('/subcategories', protectAdmin, createSubcategory);
router.route('/subcategories/:id')
  .put(protectAdmin, updateSubcategory)
  .delete(protectAdmin, deleteSubcategory);

// Template Routes
router.route('/templates')
  .get(protectAdmin, getAdminTemplates)
  .post(protectAdmin, createTemplate);

router.route('/templates/:id')
  .put(protectAdmin, updateTemplate)
  .delete(protectAdmin, deleteTemplate);

// Event Routes
router.route('/events')
  .get(protectAdmin, getAdminEvents)
  .post(protectAdmin, createEvent);

router.route('/events/:id')
  .put(protectAdmin, updateEvent)
  .delete(protectAdmin, deleteEvent);

// Admin Asset Upload
router.post('/upload', protectAdmin, upload.single('file'), uploadFile);



router.get('/referrals/leaderboard', protectAdmin, getReferralLeaderboard);

// Frame Overlay Routes
router.get('/frames', protectAdmin, getFrames);
router.post('/frames/create', protectAdmin, createFrame);
router.put('/frames/:id', protectAdmin, updateFrame);
router.delete('/frames/:id', protectAdmin, deleteFrame);

// Sticker Management Routes
router.get('/stickers', protectAdmin, getAdminStickers);
router.post('/stickers', protectAdmin, createSticker);
router.put('/stickers/:id', protectAdmin, updateSticker);
router.delete('/stickers/:id', protectAdmin, deleteSticker);

// Background Management Routes
router.get('/backgrounds', protectAdmin, getAdminBackgrounds);
router.post('/backgrounds', protectAdmin, createBackground);
router.put('/backgrounds/:id', protectAdmin, updateBackground);
router.delete('/backgrounds/:id', protectAdmin, deleteBackground);


// Feedback Routes
router.get('/feedbacks', protectAdmin, getAllFeedbacks);
router.delete('/feedbacks/:id', protectAdmin, deleteFeedback);
router.put('/feedbacks/:id/status', protectAdmin, updateFeedbackStatus);

export default router;
