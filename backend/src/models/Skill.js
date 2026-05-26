// backend/src/models/Skill.js
const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  category: String,
  skills: [{ name: String, percentage: Number }],
  tools: [String],
  order: Number
});

module.exports = mongoose.model('Skill', skillSchema);
