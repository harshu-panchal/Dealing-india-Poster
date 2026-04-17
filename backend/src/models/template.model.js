import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Template image is required'],
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    default: 'image',
  },
  isVideo: {
    type: Boolean,
    default: false,
  },
  videoUrl: {
    type: String,
    default: '',
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  isPosterOfTheDay: {
    type: Boolean,
    default: false,
  },
  tags: [String],
}, {
  timestamps: true,
});

const Template = mongoose.model('Template', templateSchema);
export default Template;
