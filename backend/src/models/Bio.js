// backend/src/models/Bio.js
const mongoose = require('mongoose');

const bioSchema = new mongoose.Schema({
  name: { type: String, default: 'Rafi Ullah' },
  title: { type: String, default: 'Full Stack Developer' },
  bio: String,
  location: String,
  email: String,
  phone: String,
  github: String,
  linkedin: String,
  funFacts: [String],
  tags: [String],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bio', bioSchema);
