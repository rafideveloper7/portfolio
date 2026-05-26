// backend/src/utils/seed.js
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const adminExists = await Admin.findOne({ username: 'admin' });
  if (!adminExists) {
    await Admin.create({
      username: 'admin',
      email: 'admin@rafios.com',
      password: 'admin123'
    });
    console.log('Admin created: admin / admin123');
  }
  console.log('Seeding complete');
  process.exit();
}
seed();
