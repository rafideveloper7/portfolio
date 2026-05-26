// backend/src/routes/music.routes.js
const router = require('express').Router();
const Music = require('../models/Music');
const auth = require('../middleware/auth');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Configure storage for music files (audio)
const musicStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rafios-music',
    allowed_formats: ['mp3', 'wav', 'ogg', 'm4a', 'aac']
  }
});

const uploadMusic = multer({ storage: musicStorage });

// Get all music files
router.get('/list', async (req, res) => {
  try {
    const music = await Music.find().sort({ uploadedAt: -1 });
    // Return just the paths for frontend consumption
    const musicPaths = music.map(m => m.path);
    res.json(musicPaths);
  } catch (error) {
    console.error('Error fetching music:', error);
    res.status(500).json({ error: 'Failed to fetch music' });
  }
});

// Upload music file
router.post('/upload', auth, uploadMusic.single('file'), async (req, res) => {
  try {
    const { title } = req.body;
    const music = new Music({
      title: title || req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    });
    
    await music.save();
    res.json({ success: true, music });
  } catch (error) {
    console.error('Error uploading music:', error);
    res.status(500).json({ success: false, error: 'Failed to upload music' });
  }
});

// Delete music file
router.delete('/delete', auth, async (req, res) => {
  try {
    const { filename } = req.query;
    const music = await Music.findOne({ filename });
    
    if (!music) {
      return res.status(404).json({ success: false, error: 'Music not found' });
    }
    
    // Delete from Cloudinary
    if (music.filename) {
      try {
        await cloudinary.uploader.destroy(music.filename);
      } catch (cloudinaryError) {
        console.warn('Cloudinary delete failed:', cloudinaryError);
      }
    }
    
    // Delete from database
    await Music.deleteOne({ _id: music._id });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting music:', error);
    res.status(500).json({ success: false, error: 'Failed to delete music' });
  }
});

// Add music by URL (no file upload)
router.post('/add-url', auth, async (req, res) => {
  try {
    const { url, title } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'URL is required' });
    const music = new Music({
      title: title || url.split('/').pop(),
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

module.exports = router;