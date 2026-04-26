const { successResponse } = require('../utils/response');
const AppError = require('../utils/AppError');

// POST /api/upload
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No file uploaded.', 400));

    return successResponse(res, 200, 'File uploaded.', {
      url: req.file.path,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadFile };
