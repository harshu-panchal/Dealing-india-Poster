import mongoose from 'mongoose';

const positionSchema = {
  x: { type: String, default: '5%' },
  y: { type: String, default: '80%' },
};

const frameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    textStyle: {
      color:         { type: String, default: '#ffffff' },
      nameSize:      { type: String, default: '1rem' },
      detailSize:    { type: String, default: '0.7rem' },
      fontWeight:    { type: String, default: 'bold' },
      textShadow:    { type: String, default: '0 2px 4px rgba(0,0,0,0.8)' },
      letterSpacing: { type: String, default: 'normal' },
      textTransform: { type: String, default: 'uppercase' },
      // Per-field absolute positions stored as % strings
      positions: {
        name:      { ...positionSchema, y: { type: String, default: '82%' } },
        phone:     { ...positionSchema, y: { type: String, default: '86%' } },
        website:   { ...positionSchema, y: { type: String, default: '88%' } },
        email:     { ...positionSchema, y: { type: String, default: '90%' } },
        address:   { ...positionSchema, y: { type: String, default: '92%' } },
        gst:       { ...positionSchema, y: { type: String, default: '94%' } },
        userPhoto: { x: { type: String, default: '70%' }, y: { type: String, default: '74%' } },
        logo:      { x: { type: String, default: '5%' },  y: { type: String, default: '74%' } },
      },
    },
  },
  {
    timestamps: true,
  }
);

const Frame = mongoose.model('Frame', frameSchema);
export default Frame;
