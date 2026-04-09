import mongoose from 'mongoose';

const musicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Music title is required'],
    trim: true
  },
  artist: {
    type: String,
    trim: true,
    default: 'Unknown Artist'
  },
  audioUrl: {
    type: String,
    required: [true, 'Audio URL is required']
  },
  thumbnailUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200'
  },
  category: {
    type: String,
    default: 'General'
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  isPopular: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Music', musicSchema);
