// backend/src/routes/upload.routes.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/image', auth, upload.single('image'), (req, res) => {
  res.json({ url: req.file.path, publicId: req.file.filename });
});

module.exports = router;
