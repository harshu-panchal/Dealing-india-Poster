import Category from '../models/category.model.js';
import Subcategory from '../models/subcategory.model.js';
import Template from '../models/template.model.js';
import Event from '../models/event.model.js';
import { localizeObject } from '../utils/localization.js';

// @desc    Get all active categories with subcategories
// @route   GET /api/user/categories
export const getPublicCategories = async (req, res) => {
  try {
    const lang = req.headers['lang'] || req.query.lang || 'en';
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    
    const categoryList = await Promise.all(categories.map(async (cat) => {
      const subcategories = await Subcategory.find({ parentId: cat._id, isActive: true }).sort({ displayOrder: 1 });
      
      const localizedCat = localizeObject(cat.toObject ? cat.toObject() : cat, lang);
      localizedCat.subcategories = subcategories.map(sub => localizeObject(sub.toObject ? sub.toObject() : sub, lang));
      
      return localizedCat;
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
    const { category, subcategory, type, isPremium, featured, potd, search, language, limit = 20, page = 1 } = req.query;

    // Base filter — always applied
    const baseFilter = { isActive: true };
    if (category) baseFilter.categoryId = category;
    if (subcategory) baseFilter.subcategoryId = subcategory;
    if (type) baseFilter.type = type;
    if (isPremium !== undefined) baseFilter.isPremium = isPremium === 'true';
    if (featured === 'true') baseFilter.isPosterOfTheDay = true;
    if (potd === 'true') baseFilter.isPosterOfTheDay = true;

    const lang = req.headers['lang'] || req.query.lang || 'en';

    // Build search condition (if any)
    let searchCondition = null;
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const [matchingCats, matchingSubs, matchingEvents] = await Promise.all([
        Category.find({ name: searchRegex, isActive: true }).select('_id'),
        Subcategory.find({ name: searchRegex, isActive: true }).select('_id'),
        Event.find({ name: searchRegex, isActive: true }).select('_id')
      ]);
      searchCondition = {
        $or: [
          { name: searchRegex },
          { tags: searchRegex },
          { categoryId: { $in: matchingCats.map(c => c._id) } },
          { subcategoryId: { $in: matchingSubs.map(s => s._id) } },
          { eventId: { $in: matchingEvents.map(e => e._id) } }
        ]
      };
    }

    // Helper: compose final filter from base + optional conditions
    const buildFilter = (...conditions) => {
      const active = conditions.filter(Boolean);
      if (active.length === 0) return { ...baseFilter };
      return { ...baseFilter, $and: active };
    };

    // Try language-specific filter first; fall back to ALL available if no results
    // Skip language filter for 'English' (default) — all templates qualify, avoids edge cases
    let filter = buildFilter(searchCondition);
    if (language && language !== 'English') {
      const langCondition = {
        $or: [
          { language: language },
          { language: 'English' },      // always include English as fallback content
          { language: { $exists: false } },
          { language: null },
          { language: '' }
        ]
      };
      const langFilter = buildFilter(langCondition, searchCondition);
      const langCount = await Template.countDocuments(langFilter);
      if (langCount > 0) {
        filter = langFilter;
      }
      // If langCount === 0, fall through and use all-language filter (show whatever is available)
    }

    const templates = await Template.find(filter)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 })
      .populate('categoryId', 'name image')
      .populate('subcategoryId', 'name image');

    const localizedTemplates = templates.map(tpl => {
      const t = tpl.toObject();
      const localized = localizeObject(t, lang);

      // Preserve _id as string to ensure consistent frontend comparisons
      localized._id = t._id?.toString();

      if (t.categoryId) {
        const localizedCat = localizeObject(t.categoryId, lang);
        // Ensure _id is a string for reliable === comparisons on frontend
        localizedCat._id = t.categoryId._id?.toString();
        localized.categoryId = localizedCat;
      }
      if (t.subcategoryId) {
        const localizedSub = localizeObject(t.subcategoryId, lang);
        localizedSub._id = t.subcategoryId._id?.toString();
        localized.subcategoryId = localizedSub;
      }

      return localized;
    });

    const total = await Template.countDocuments(filter);

    // If searching, also return matching categories and subcategories
    let foundCategories = [];
    let foundSubcategories = [];
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const [cats, subs] = await Promise.all([
        Category.find({ name: searchRegex, isActive: true }).limit(5),
        Subcategory.find({ name: searchRegex, isActive: true }).limit(5)
      ]);
      foundCategories = cats.map(c => localizeObject(c.toObject(), lang));
      foundSubcategories = subs.map(s => localizeObject(s.toObject(), lang));
    }

    res.status(200).json({
      templates: localizedTemplates,
      categories: foundCategories,
      subcategories: foundSubcategories,
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
