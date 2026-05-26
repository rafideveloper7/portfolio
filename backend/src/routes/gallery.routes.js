// backend/src/routes/gallery.routes.js
const router = require('express').Router();
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Gallery storage — supports images AND videos
const galleryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // mimetype may be undefined at params stage in some multer versions
    // detect from originalname extension as fallback
    const mime = file.mimetype || '';
    const name = (file.originalname || '').toLowerCase();
    const isVideo = mime.startsWith('video/') ||
      /\.(mp4|webm|mov|avi|mkv|ogg)$/i.test(name);
    return {
      folder: 'rafios-gallery',
      resource_type: isVideo ? 'video' : 'image',
      public_id: `gallery_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    };
  },
});

const uploadGallery = multer({
  storage: galleryStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// ── GET /list — public ───────────────────────────────────────────
router.get('/list', async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ uploadedAt: -1 });
    res.json(gallery.map(g => g.path));
  } catch (error) {
    console.error('Gallery list error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

// ── GET /items — admin full objects ──────────────────────────────
router.get('/items', auth, async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ uploadedAt: -1 });
    res.json(gallery.map(g => ({ path: g.path, filename: g.filename, type: g.type })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// ── POST /upload — file upload via Cloudinary ────────────────────
router.post('/upload', auth, (req, res, next) => {
  uploadGallery.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary upload error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file received' });

    const mime = req.file.mimetype || '';
    const name = (req.file.originalname || '').toLowerCase();
    const isVideo = mime.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv|ogg)$/i.test(name);
    const type = isVideo ? 'video' : 'image';

    const path = req.file.path || req.file.secure_url;
    const filename = req.file.filename || req.file.public_id;

    const galleryItem = new Gallery({ filename, path, type, size: req.file.size || 0 });
    await galleryItem.save();

    res.json({ success: true, galleryItem });
  } catch (error) {
    console.error('Gallery save error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /add-url — add by URL ───────────────────────────────────
router.post('/add-url', auth, async (req, res) => {
  try {
    const { url, type } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'URL is required' });
    const mediaType = type || (/(mp4|webm|ogg|mov)/i.test(url) ? 'video' : 'image');
    const galleryItem = new Gallery({ filename: url, path: url, type: mediaType });
    await galleryItem.save();
    res.json({ success: true, galleryItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── DELETE /delete ───────────────────────────────────────────────
router.delete('/delete', auth, async (req, res) => {
  try {
    const { filename } = req.query;
    const galleryItem = await Gallery.findOne({ filename });
    if (!galleryItem) return res.status(404).json({ success: false, error: 'Not found' });

    // Delete from Cloudinary (try both resource types)
    try {
      await cloudinary.uploader.destroy(galleryItem.filename, { resource_type: galleryItem.type === 'video' ? 'video' : 'image' });
    } catch (e) { console.warn('Cloudinary delete warning:', e.message); }

    await Gallery.deleteOne({ _id: galleryItem._id });
    res.json({ success: true });
  } catch (error) {
    console.error('Gallery delete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
