// backend/src/routes/bio.routes.js
const router = require('express').Router();
const Bio = require('../models/Bio');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  let bio = await Bio.findOne();
  if (!bio) {
    bio = { name: 'Rafi Ullah', title: 'Full Stack Developer · MERN Stack', location: 'Kohat, Pakistan', email: 'rafideveloper7@gmail.com', funFacts: ['Love Badminton', 'Travelling'], tags: ['MERN', 'AI'] };
  }
  res.json(bio);
});

router.put('/', auth, async (req, res) => {
  const bio = await Bio.findOneAndUpdate({}, req.body, { upsert: true, new: true });
  res.json(bio);
});

module.exports = router;
