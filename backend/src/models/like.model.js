import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  }
}, {
  timestamps: true
});

// Ensure a user can only like a specific template once
likeSchema.index({ userId: 1, templateId: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);
export default Like;
