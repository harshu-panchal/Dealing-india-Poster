import mongoose from 'mongoose';

const stickerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Sticker = mongoose.model('Sticker', stickerSchema);

export default Sticker;
