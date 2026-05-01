import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    en: { type: String, required: [true, 'English name is required'], trim: true },
    hi: { type: String, trim: true },
    gu: { type: String, trim: true },
    mr: { type: String, trim: true },
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  type: {
    type: String,
    enum: ['image', 'video', 'all'],
    default: 'all',
  },
  image: {
    type: String,
    default: '',
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
