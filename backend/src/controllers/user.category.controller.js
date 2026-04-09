import Category from '../models/category.model.js';
import Subcategory from '../models/subcategory.model.js';
import Template from '../models/template.model.js';

// @desc    Get all active categories with subcategories
// @route   GET /api/user/categories
export const getPublicCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    
    const categoryList = await Promise.all(categories.map(async (cat) => {
      const subcategories = await Subcategory.find({ parentId: cat._id, isActive: true }).sort({ displayOrder: 1 });
      return {
        ...cat._doc,
        subcategories
      };
    }));

    res.status(200).json(categoryList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get templates with filters
// @route   GET /api/user/templates
export const getPublicTemplates = async (req, res) => {
  try {
    const { category, subcategory, type, isPremium, limit = 20, page = 1 } = req.query;
    const filter = { isActive: true };

    if (category) filter.categoryId = category;
    if (subcategory) filter.subcategoryId = subcategory;
    if (type) filter.type = type;
    if (isPremium !== undefined) filter.isPremium = isPremium === 'true';

    const templates = await Template.find(filter)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Template.countDocuments(filter);

    res.status(200).json({
      templates,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
