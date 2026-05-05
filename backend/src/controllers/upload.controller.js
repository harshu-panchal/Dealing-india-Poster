import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// @desc    Upload a file (Image or Audio)
// @route   POST /api/upload
// @access  Private
export const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Upload to Cloudinary with auto resource type (handles video/audio/image)
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'dealing_india_posters',
      resource_type: 'auto'
    });

    // Delete local file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(200).json({
      message: 'File uploaded successfully to Cloudinary',
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type
    });
  } catch (error) {
    // Remove local file if upload fails
    if (req.file && fs.existsSync(req.file.path)) {
       fs.unlinkSync(req.file.path);
    }
    console.error('Cloudinary upload error:', error);
    
    if (error.message && error.message.includes('File size too large')) {
      return res.status(400).json({ 
        message: 'File is too large. Max limit is 10MB.',
        error: error.message 
      });
    }

    res.status(500).json({ message: 'Failed to upload file to Cloudinary' });
  }
};
