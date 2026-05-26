// backend/src/models/Settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  wallpaperType: { type: String, enum: ['gradient', 'image', 'color'], default: 'gradient' },
  wallpaperValue: { type: String, default: '' }, // URL for image, hex for color, name for gradient
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
