// backend/src/routes/settings.routes.js
const router = require('express').Router();
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

// Get settings (public)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = { wallpaperType: 'gradient', wallpaperValue: '' };
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update settings (admin only)
router.put('/', auth, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      {},
      { ...req.body, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
