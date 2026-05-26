// backend/src/routes/project.routes.js
const router = require('express').Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

router.get('/', async (req, res) => {
  const projects = await Project.find().sort({ featured: -1, order: 1 });
  res.json(projects);
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  const data = JSON.parse(req.body.data);
  if (req.file) {
    data.image = req.file.path;
    data.imagePublicId = req.file.filename;
  }
  const project = new Project(data);
  await project.save();
  res.json(project);
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  const project = await Project.findById(req.params.id);
  const data = JSON.parse(req.body.data);
  if (req.file) {
    if (project.imagePublicId) await cloudinary.uploader.destroy(project.imagePublicId);
    data.image = req.file.path;
    data.imagePublicId = req.file.filename;
  }
  Object.assign(project, data);
  await project.save();
  res.json(project);
});

router.delete('/:id', auth, async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (project.imagePublicId) await cloudinary.uploader.destroy(project.imagePublicId);
  await project.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;
