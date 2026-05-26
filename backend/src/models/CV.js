// backend/src/models/CV.js
const mongoose = require('mongoose');

const cvSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CV', cvSchema);