// backend/src/models/Settings.js
const mongoose = require('mongoose');

const wallpaperSchema = {
  type: { type: String, enum: ['gradient', 'image', 'color'], default: 'gradient' },
  value: { type: String, default: '' },
};

const settingsSchema = new mongoose.Schema({
  // Desktop wallpaper
  wallpaperType:  { type: String, enum: ['gradient', 'image', 'color'], default: 'gradient' },
  wallpaperValue: { type: String, default: '' },
  // Mobile wallpaper (separate)
  mobileWallpaperType:  { type: String, enum: ['gradient', 'image', 'color'], default: 'gradient' },
  mobileWallpaperValue: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
