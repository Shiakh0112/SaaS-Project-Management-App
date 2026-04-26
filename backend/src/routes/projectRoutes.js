const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { validateProject, validateUpdateProject } = require('../validators/appValidator');
const { upload, uploadToCloud } = require('../middleware/upload');

router.use(protect);

router.post('/create', validateProject, createProject);
router.get('/', getProjects);
router.get('/:projectId', getProjectById);
router.put('/update/:projectId', upload.single('cover'), uploadToCloud, validateUpdateProject, updateProject);
router.delete('/delete/:projectId', deleteProject);

module.exports = router;
