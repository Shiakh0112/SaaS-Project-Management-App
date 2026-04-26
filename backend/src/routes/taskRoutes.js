const express = require('express');
const router = express.Router();
const { createTask, getTasksByBoard, updateTask, deleteTask, moveTask, addComment } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { validateTask, validateComment } = require('../validators/appValidator');
const upload = require('../middleware/upload');

router.use(protect);

router.post('/create', validateTask, createTask);
router.get('/:boardId', getTasksByBoard);
router.put('/update/:taskId', upload.single('cover'), updateTask);
router.delete('/delete/:taskId', deleteTask);
router.put('/move/:taskId', moveTask);
router.post('/comment/:taskId', upload.single('attachment'), validateComment, addComment);

module.exports = router;
