import Template from '../models/template.model.js';
import Category from '../models/category.model.js';
import Subcategory from '../models/subcategory.model.js';

// @desc    Get all templates with pagination and filters
// @route   GET /api/admin/templates
export const getAdminTemplates = async (req, res) => {
  try {
    const { category, type, search, language, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) filter.categoryId = category;
    if (type) filter.type = type;
    if (language) filter.language = language;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const templates = await Template.find(filter)
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .populate('eventId', 'name')
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

// @desc    Create a new template
// @route   POST /api/admin/templates
export const createTemplate = async (req, res) => {
  try {
    const { name, image, categoryId, subcategoryId, eventId, type, isVideo, videoUrl, audioUrl, duration, isPremium, tags, language } = req.body;
    
    const template = await Template.create({
      name,
      image,
      categoryId,
      subcategoryId: subcategoryId || undefined,
      eventId: eventId || undefined,
      type,
      isVideo: isVideo === true || type === 'video',
      videoUrl,
      audioUrl,
      duration: duration || 10,
      isPremium,
      tags,
      language: language || 'English'
    });

    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update template
// @route   PUT /api/admin/templates/:id
export const updateTemplate = async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: false }
    );
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete template
// @route   DELETE /api/admin/templates/:id
export const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });

    await template.deleteOne();
    res.status(200).json({ message: 'Template removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
