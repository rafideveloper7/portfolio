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

router.post('/upload-image', auth, (req, res, next) => {
  if (req.headers['content-type']?.includes('application/json')) {
    return next();
  }
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    next();
  });
}, async (req, res) => {
  try {
    let path, publicId;
    if (req.file) {
      path = req.file.path || req.file.secure_url;
      publicId = req.file.filename || req.file.public_id;
    } else {
      path = req.body.image || req.body.url;
      publicId = req.body.filename || req.body.publicId;
    }

    if (!path) return res.status(400).json({ success: false, error: 'No image data received' });

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
