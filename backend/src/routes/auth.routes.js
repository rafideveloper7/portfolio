// backend/src/routes/auth.routes.js
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isValid = await admin.comparePassword(password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ adminId: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, admin: { username: admin.username, email: admin.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
