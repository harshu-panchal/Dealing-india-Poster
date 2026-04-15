import Category from '../models/category.model.js';
import Subcategory from '../models/subcategory.model.js';
import Template from '../models/template.model.js';
import Event from '../models/event.model.js';

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

// @desc    Get "What's New" content (recent categories, events, and templates)
// @route   GET /api/user/whats-new
export const getWhatsNewContent = async (req, res) => {
  try {
    const limit = 15;

    // Fetch recent categories
    const categories = await Category.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch recent events
    const events = await Event.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch recent templates
    const templates = await Template.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedUpdates = [];

    // Process Categories
    for (const cat of categories) {
      const count = await Template.countDocuments({ categoryId: cat._id, isActive: true });
      formattedUpdates.push({
        id: cat._id,
        title: cat.name,
        subtitle: `${count} new posters uploaded`,
        image: cat.image,
        date: cat.createdAt,
        type: 'category',
        rawType: cat.type
      });
    }

    // Process Events
    for (const event of events) {
      const count = await Template.countDocuments({ eventId: event._id, isActive: true });
      formattedUpdates.push({
        id: event._id,
        title: event.name,
        subtitle: `${count} templates available`,
        image: event.image,
        date: event.createdAt,
        type: 'event'
      });
    }

    // Process Templates
    for (const temp of templates) {
      formattedUpdates.push({
        id: temp._id,
        title: temp.name,
        subtitle: temp.isVideo ? 'New video template' : 'New image template',
        image: temp.image,
        date: temp.createdAt,
        type: 'template',
        isVideo: temp.isVideo,
        templateData: temp
      });
    }

    // Sort by date and limit
    const sortedUpdates = formattedUpdates
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    res.status(200).json(sortedUpdates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
