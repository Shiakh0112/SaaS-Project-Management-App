const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
];

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('File type not allowed'), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadToCloudinary = (buffer, folder, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
};

const getFolder = (fieldname) => {
  const folders = { avatar: 'saas-pm/avatars', attachment: 'saas-pm/attachments', cover: 'saas-pm/covers' };
  return folders[fieldname] || 'saas-pm/misc';
};

// Middleware to upload file to Cloudinary after multer processes it
const uploadToCloud = async (req, res, next) => {
  if (!req.file) return next();
  try {
    const folder = getFolder(req.file.fieldname);
    const result = await uploadToCloudinary(req.file.buffer, folder);
    req.file.path = result.secure_url;
    req.file.filename = result.public_id;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { upload, uploadToCloudinary, uploadToCloud, getFolder };
