// backend/src/routes/cv.routes.js
const router = require('express').Router();
const CV = require('../models/CV');
const auth = require('../middleware/auth');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

const cvStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'rafios-cv',
    resource_type: 'raw',
    public_id: `cv_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
  }),
});

const uploadCV = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  },
});

router.get('/list', async (req, res) => {
  try {
    const cvs = await CV.find().sort({ uploadedAt: -1 });
    res.json(cvs.map(c => ({ path: c.path, filename: c.filename, originalName: c.originalName })));
  } catch (error) {
    console.error('CV list error:', error);
    res.status(500).json({ error: 'Failed to fetch CVs' });
  }
});

router.get('/items', auth, async (req, res) => {
  try {
    const cvs = await CV.find().sort({ uploadedAt: -1 });
    res.json(cvs.map(c => ({ path: c.path, filename: c.filename, originalName: c.originalName, size: c.size, uploadedAt: c.uploadedAt })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch CV items' });
  }
});

router.post('/add-url', auth, async (req, res) => {
  try {
    const { url, filename, originalName } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'URL is required' });
    const cv = new CV({
      filename: filename || url,
      path: url,
      originalName: originalName || 'CV.pdf',
      size: 0,
    });
    await cv.save();
    res.json({ success: true, cv });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/delete', auth, async (req, res) => {
  try {
    const { filename } = req.query;
    const cv = await CV.findOne({ filename });
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });

    try {
      await cloudinary.uploader.destroy(cv.filename, { resource_type: 'raw' });
    } catch (e) { console.warn('Cloudinary delete warning:', e.message); }

    await CV.deleteOne({ _id: cv._id });
    res.json({ success: true });
  } catch (error) {
    console.error('CV delete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;