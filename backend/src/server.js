// backend/src/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const bioRoutes = require('./routes/bio.routes');
const skillRoutes = require('./routes/skill.routes');
const contactRoutes = require('./routes/contact.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

// Allow multiple origins: local dev + any vercel.app + explicit FRONTEND_URL
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain (covers preview deployments too)
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow explicitly listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow localhost on any port
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bio', bioRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/music', require('./routes/music.routes'));
app.use('/api/gallery', require('./routes/gallery.routes'));
app.use('/api/settings', require('./routes/settings.routes'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', env: process.env.NODE_ENV }));

// Connect to MongoDB once (cached for serverless)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
  console.log('✅ MongoDB Connected');
};

connectDB().catch(err => console.error('MongoDB error:', err));

// Only start HTTP server in non-serverless environments
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
}

// Export for Vercel serverless
module.exports = app;
