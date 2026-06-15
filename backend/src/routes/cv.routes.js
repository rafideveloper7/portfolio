// backend/src/routes/cv.routes.js
const router = require('express').Router();
const CV = require('../models/CV');
const auth = require('../middleware/auth');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// 1. Storage engine saves the file cleanly with a trailing .pdf extension string
const cvStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const fileExt = file.originalname.split('.').pop().toLowerCase() || 'pdf';
    return {
      folder: 'rafios-cv',
      resource_type: 'raw', // Keeps the original PDF bytes uncorrupted
      public_id: `cv_${Date.now()}_${Math.floor(Math.random() * 9999)}.${fileExt}`, 
    };
  },
});

const uploadCV = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  },
});

// 2. Returns the active .path array payload cleanly to your Next.js route handler
router.get('/list', async (req, res) => {
  try {
    const cvs = await CV.find().sort({ uploadedAt: -1 });
    res.json(cvs.map(c => ({ path: c.path, filename: c.filename, originalName: c.originalName })));
  } catch (error) {
    console.error('CV list error:', error);
    res.status(500).json({ error: 'Failed to fetch CVs' });
  }
});

router.post('/upload', auth, (req, res, next) => {
  uploadCV.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer CV upload error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file received' });
    
    const cv = new CV({
      filename: req.file.filename || req.file.public_id,
      path: req.file.path || req.file.secure_url,
      originalName: req.file.originalname || 'CV.pdf',
      size: req.file.size || 0,
      uploadedBy: req.adminId, 
    });
    await cv.save();
    res.json({ success: true, cv });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Delete function targets the correct asset engine profile
router.delete('/delete', auth, async (req, res) => {
  try {
    const { filename } = req.query;
    const cv = await CV.findOne({ filename });
    if (!cv) return res.status(404).json({ success: false, error: 'CV not found' });

    try {
      // Targets 'raw' storage explicitly so old records clear completely from Cloudinary
      await cloudinary.uploader.destroy(cv.filename, { resource_type: 'raw' });
    } catch (e) { console.warn('Cloudinary delete warning:', e.message); }

    await CV.deleteOne({ _id: cv._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;