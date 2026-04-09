import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
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
