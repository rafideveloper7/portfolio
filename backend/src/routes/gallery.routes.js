// backend/src/routes/gallery.routes.js
const router = require('express').Router();
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Configure storage for gallery files (images/videos)
const galleryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rafios-gallery',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'mp4', 'webm', 'ogg']
  }
});

const uploadGallery = multer({ storage: galleryStorage });

// Get all gallery files
router.get('/list', async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ uploadedAt: -1 });
    // Return just the paths for frontend consumption
    const galleryPaths = gallery.map(g => g.path);
    res.json(galleryPaths);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

// Upload gallery file
router.post('/upload', auth, uploadGallery.single('file'), async (req, res) => {
  try {
    const { filename, path, size, format } = req.file;
    const type = format.startsWith('video') ? 'video' : 'image';
    
    const galleryItem = new Gallery({
      filename,
      path,
      type,
      size
    });
    
    await galleryItem.save();
    res.json({ success: true, galleryItem });
  } catch (error) {
    console.error('Error uploading gallery file:', error);
    res.status(500).json({ success: false, error: 'Failed to upload gallery file' });
  }
});

// Delete gallery file
router.delete('/delete', auth, async (req, res) => {
  try {
    const { filename } = req.query;
    const galleryItem = await Gallery.findOne({ filename });
    
    if (!galleryItem) {
      return res.status(404).json({ success: false, error: 'Gallery file not found' });
    }
    
    // Delete from Cloudinary
    if (galleryItem.filename) {
      try {
        await cloudinary.uploader.destroy(galleryItem.filename);
      } catch (cloudinaryError) {
        console.warn('Cloudinary delete failed:', cloudinaryError);
      }
    }
    
    // Delete from database
    await Gallery.deleteOne({ _id: galleryItem._id });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting gallery file:', error);
    res.status(500).json({ success: false, error: 'Failed to delete gallery file' });
  }
});

// Get all gallery files (admin - full objects with filename)
router.get('/items', auth, async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ uploadedAt: -1 });
    res.json(gallery.map(g => ({ path: g.path, filename: g.filename, type: g.type })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// Add gallery item by URL (no file upload)
router.post('/add-url', auth, async (req, res) => {
  try {
    const { url, type } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'URL is required' });
    const mediaType = type || (/(mp4|webm|ogg)/i.test(url) ? 'video' : 'image');
    const galleryItem = new Gallery({
      filename: url,
      path: url,
      type: mediaType,
    });
    await galleryItem.save();
    res.json({ success: true, galleryItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;