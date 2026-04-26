const express = require('express');
const router = express.Router();
const { getMe, updateProfile, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload, uploadToCloud } = require('../middleware/upload');

router.use(protect);

router.get('/me', getMe);
router.put('/update-profile', upload.single('avatar'), uploadToCloud, updateProfile);
router.get('/:id', getUserById);

module.exports = router;
