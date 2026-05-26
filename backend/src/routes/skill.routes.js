// backend/src/routes/skill.routes.js
const router = require('express').Router();
const Skill = require('../models/Skill');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  const skills = await Skill.find().sort({ order: 1 });
  res.json(skills);
});

router.put('/', auth, async (req, res) => {
  await Skill.deleteMany({});
  const skills = await Skill.insertMany(req.body);
  res.json(skills);
});

module.exports = router;
