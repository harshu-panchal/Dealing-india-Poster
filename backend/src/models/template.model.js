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
  fields: [
    {
      _id: false,
      key: { type: String, required: true },
      label: { type: String },
      type: { type: String, enum: ['text', 'image'], default: 'text' },
      position: {
        x: { type: String, default: '10%' },
        y: { type: String, default: '10%' },
      },
      style: {
        fontSize: { type: String, default: '14px' },
        color: { type: String, default: '#000000' },
        fontWeight: { type: String, default: 'bold' },
      },
      size: {
        width: { type: String, default: 'auto' },
        height: { type: String, default: 'auto' },
      },
    }
  ],
  canvasSize: {
    width: { type: Number, default: 500 },
    height: { type: Number, default: 286 },
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
  audioUrl: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    default: 10, // Default 10 seconds
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
  language: {
    type: String,
    enum: ['English'],
    default: 'English',
  },
}, {
  timestamps: true,
});

const Template = mongoose.model('Template', templateSchema);
export default Template;
