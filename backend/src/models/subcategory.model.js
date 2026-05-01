import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
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
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Parent category is required'],
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);
export default Subcategory;
