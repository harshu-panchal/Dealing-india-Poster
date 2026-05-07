import mongoose from 'mongoose';

const backgroundSchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Background image is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Background = mongoose.model('Background', backgroundSchema);
export default Background;
