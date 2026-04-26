const express = require('express');
const router = express.Router();
const { createBoard, getBoardsByProject, updateBoard, deleteBoard } = require('../controllers/boardController');
const { protect } = require('../middleware/auth');
const { validateBoard } = require('../validators/appValidator');

router.use(protect);

router.post('/create', validateBoard, createBoard);
router.get('/:projectId', getBoardsByProject);
router.put('/update/:boardId', updateBoard);
router.delete('/delete/:boardId', deleteBoard);

module.exports = router;
