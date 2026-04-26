const express = require('express');
const router = express.Router();
const { createList, updateList, deleteList, getListsByBoard } = require('../controllers/listController');
const { protect } = require('../middleware/auth');
const { validateList } = require('../validators/appValidator');

router.use(protect);

router.post('/create', validateList, createList);
router.get('/board/:boardId', getListsByBoard);
router.put('/update/:listId', updateList);
router.delete('/delete/:listId', deleteList);

module.exports = router;
