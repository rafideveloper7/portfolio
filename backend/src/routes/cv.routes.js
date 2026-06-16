// backend/src/routes/cv.routes.js
const router = require('express').Router();
const CV = require('../models/CV');
const auth = require('../middleware/auth');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// ==========================================
// 1. CLOUDINARY BINARY ENGINE CONFIG
// ==========================================
const cvStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const fileExt = file.originalname.split('.').pop().toLowerCase() || 'pdf';
    return {
      folder: 'rafios-cv',
      resource_type: 'raw', // Keeps PDF bytes uncorrupted
      public_id: `cv_${Date.now()}_${Math.floor(Math.random() * 9999)}.${fileExt}`, 
    };
  },
});

const uploadCV = multer({
  storage: cvStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // Slightly bumped to 15MB for large portfolio PDFs
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF documents are allowed via binary upload'), false);
  },
});

// ==========================================
// 2. HELPER: REUSABLE DB DOCUMENT CREATOR
// ==========================================
const saveCvToDatabase = async ({ filename, path, originalName, size, adminId }) => {
  const cv = new CV({
    filename,
    path,
    originalName: originalName || 'Document.pdf',
    size: size || 0,
    uploadedBy: adminId,
  });
  return await cv.save();
};

// ==========================================
// 3. GET: FETCH ALL CV ENTRIES
// ==========================================
router.get('/list', async (req, res) => {
  try {
    const cvs = await CV.find().sort({ uploadedAt: -1 });
    // Returns full documents cleanly structured so your frontend knows the origin profiles
    res.json(cvs.map(c => ({ 
      id: c._id,
      path: c.path, 
      filename: c.filename, 
      originalName: c.originalName,
      uploadedAt: c.uploadedAt 
    })));
  } catch (error) {
    console.error('CV list fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch CVs' });
  }
});

// ==========================================
// 4. POST: HANDLER A - BINARY FILE UPLOAD (Cloudinary)
// ==========================================
router.post('/upload', auth, (req, res, next) => {
  uploadCV.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer file system upload error:', err);
      return res.status(400).json({ success: false, error: err.message || 'Upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No binary file attachment received' });
    
    const savedRecord = await saveCvToDatabase({
      filename: req.file.filename || req.file.public_id,
      path: req.file.path || req.file.secure_url,
      originalName: req.file.originalname,
      size: req.file.size,
      adminId: req.adminId
    });

    res.status(201).json({ success: true, method: 'cloudinary', cv: savedRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 5. POST: HANDLER B - MANUAL URL INGESTION (Drive, OneDrive, Links)
// ==========================================
router.post('/add-url', auth, async (req, res) => {
  try {
    let { url, originalName, size } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'Target destination URL path is required' });
    }

    // Clean up Google Drive interface URLs on-the-fly to ensure raw accessibility 
    if (url.includes('drive.google.com') && url.includes('/view')) {
      url = url.replace('/view?usp=sharing', '/preview').replace('/view', '/preview');
    }

    // Virtual asset tracking tokens for reference indices
    const uniqueId = `url_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
    const mockFilename = `external-link/${uniqueId}`;

    const savedRecord = await saveCvToDatabase({
      filename: mockFilename,
      path: url,
      originalName: originalName || 'External-Link-CV.pdf',
      size: size || 0,
      adminId: req.adminId
    });

    res.status(201).json({ success: true, method: 'url_ingestion', cv: savedRecord });
  } catch (error) {
    console.error('Error in manual URL ingestion route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 6. DELETE: CONDITIONAL ASSET CLEANUP
// ==========================================
router.delete('/delete', auth, async (req, res) => {
  try {
    const { filename } = req.query;
    const cv = await CV.findOne({ filename });
    if (!cv) return res.status(404).json({ success: false, error: 'CV resource document matching index not found' });

    // Conditional evaluation: Only invoke Cloudinary engine if file is truly hosted there
    if (cv.filename && cv.filename.startsWith('rafios-cv/')) {
      try {
        await cloudinary.uploader.destroy(cv.filename, { resource_type: 'raw' });
      } catch (cloudinaryErr) { 
        console.warn('Cloudinary structural clear warnings skipped:', cloudinaryErr.message); 
      }
    }

    await CV.deleteOne({ _id: cv._id });
    res.json({ success: true, message: 'Resource cleanly unlinked from cluster core database' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;