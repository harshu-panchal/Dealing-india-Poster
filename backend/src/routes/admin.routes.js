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
import { getDashboardStats } from '../controllers/admin.dashboard.controller.js';
import { uploadFile } from '../controllers/upload.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { protectAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/logout', protectAdmin, logoutAdmin);

// Protected Admin Routes
router.get('/users', protectAdmin, getUsers);
router.get('/dashboard-stats', protectAdmin, getDashboardStats);
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

// Admin Asset Upload
router.post('/upload', protectAdmin, upload.single('file'), uploadFile);

export default router;
