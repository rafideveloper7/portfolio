// backend/src/models/Music.js
const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number }, // file size in bytes
  duration: { type: Number }, // duration in seconds
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Music', musicSchema);