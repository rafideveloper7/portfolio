// backend/src/routes/bio.routes.js
const router = require('express').Router();
const Bio = require('../models/Bio');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', async (req, res) => {
  let bio = await Bio.findOne();
  if (!bio) {
    bio = {
      name: 'Rafi Ullah',
      title: 'Full Stack Developer · MERN Stack',
      location: 'Kohat, Pakistan',
      email: 'rafideveloper7@gmail.com',
      funFacts: ['Love Badminton', 'Travelling'],
      tags: ['MERN', 'AI'],
    };
  }
  res.json(bio);
});

router.put('/', auth, async (req, res) => {
  const bio = await Bio.findOneAndUpdate({}, req.body, { upsert: true, new: true });
  res.json(bio);
});

router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No image file received' });
    const path = req.file.path || req.file.secure_url;
    const publicId = req.file.filename;
    const bio = await Bio.findOneAndUpdate({}, { image: path, imagePublicId: publicId }, { new: true, upsert: true });
    res.json({ success: true, bio });
  } catch (error) {
    console.error('Bio image upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/image', auth, async (req, res) => {
  try {
    const bio = await Bio.findOne();
    if (bio && bio.imagePublicId) {
      try { await require('../config/cloudinary').uploader.destroy(bio.imagePublicId); } catch (e) { console.warn('Cloudinary delete warning:', e.message); }
    }
    await Bio.findOneAndUpdate({}, { $unset: { image: '', imagePublicId: '' } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
