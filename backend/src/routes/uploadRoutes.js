const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { upload, uploadToCloud } = require('../middleware/upload');

router.post('/', protect, upload.single('attachment'), uploadToCloud, uploadFile);

module.exports = router;
