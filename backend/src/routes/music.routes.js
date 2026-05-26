// backend/src/routes/music.routes.js
const router = require('express').Router();
const Music = require('../models/Music');
const auth = require('../middleware/auth');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Music storage — Cloudinary uses resource_type 'video' for audio files
const musicStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'rafios-music',
    resource_type: 'video', // Cloudinary handles audio under 'video' resource type
    allowed_formats: ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'],
    public_id: `music_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
  }),
});

const uploadMusic = multer({
  storage: musicStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

// ── GET /list — public ───────────────────────────────────────────
router.get('/list', async (req, res) => {
  try {
    const music = await Music.find().sort({ uploadedAt: -1 });
    res.json(music.map(m => m.path));
  } catch (error) {
    console.error('Music list error:', error);
    res.status(500).json({ error: 'Failed to fetch music' });
  }
});

// ── POST /upload — file upload via Cloudinary ────────────────────
router.post('/upload', auth, (req, res, next) => {
  uploadMusic.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary music upload error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file received' });

    const path = req.file.path || req.file.secure_url;
    const filename = req.file.filename || req.file.public_id;
    const title = req.body.title || req.file.originalname || filename;

    const music = new Music({
      title,
      filename,
      path,
      size: req.file.size || 0,
    });
    await music.save();

    res.json({ success: true, music });
  } catch (error) {
    console.error('Music save error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /add-url — add by URL ───────────────────────────────────
router.post('/add-url', auth, async (req, res) => {
  try {
    const { url, title } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'URL is required' });
    const music = new Music({
      title: title || url.split('/').pop().replace(/\.[^.]+$/, ''),
      filename: url,
      path: url,
      size: 0,
    });
    await music.save();
    res.json({ success: true, music });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── DELETE /delete ───────────────────────────────────────────────
router.delete('/delete', auth, async (req, res) => {
  try {
    const { filename } = req.query;
    const music = await Music.findOne({ filename });
    if (!music) return res.status(404).json({ success: false, error: 'Music not found' });

    // Delete from Cloudinary — audio is stored under resource_type 'video'
    try {
      await cloudinary.uploader.destroy(music.filename, { resource_type: 'video' });
    } catch (e) { console.warn('Cloudinary delete warning:', e.message); }

    await Music.deleteOne({ _id: music._id });
    res.json({ success: true });
  } catch (error) {
    console.error('Music delete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
