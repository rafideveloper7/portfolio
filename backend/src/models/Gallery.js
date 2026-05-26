// backend/src/models/Gallery.js
const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], required: true }, // image or video
  size: { type: Number }, // file size in bytes
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gallery', gallerySchema);