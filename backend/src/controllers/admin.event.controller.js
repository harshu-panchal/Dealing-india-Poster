import mongoose from 'mongoose';
import Event from '../models/event.model.js';
import Template from '../models/template.model.js';

// @desc    Get all events (Admin)
// @route   GET /api/admin/events
export const getAdminEvents = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ date: 1 }).populate('categoryId', 'name').lean();
    
    // Add template counts
    const eventsWithCounts = await Promise.all(events.map(async (event) => {
      const templateCount = await Template.countDocuments({ eventId: event._id });
      return { ...event, templateCount };
    }));

    res.status(200).json(eventsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new event
// @route   POST /api/admin/events
export const createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/admin/events/:id
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/admin/events/:id
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Remove eventId from templates
    await Template.updateMany({ eventId: req.params.id }, { $unset: { eventId: "" } });
    
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get events for user calendar
// @route   GET /api/user/events
export const getPublicEvents = async (req, res) => {
  try {
    const events = await Event.find({ isActive: { $ne: false } }).sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get templates for specific event
// @route   GET /api/user/events/:id/templates
export const getEventTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ 
      eventId: new mongoose.Types.ObjectId(req.params.id), 
      isActive: { $ne: false } 
    });
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
