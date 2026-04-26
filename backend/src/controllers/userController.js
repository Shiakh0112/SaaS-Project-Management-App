const User = require('../models/User');
const { successResponse } = require('../utils/response');
const AppError = require('../utils/AppError');
const cloudinary = require('../config/cloudinary');

// GET /api/users/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return successResponse(res, 200, 'User fetched.', { user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/update-profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const updateData = {};
    if (name) updateData.name = name;

    // Handle password change
    if (currentPassword && newPassword) {
      const user = await User.findById(req.user._id).select('+password');
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) return next(new AppError('Current password is incorrect.', 400));
      if (newPassword.length < 8) return next(new AppError('New password must be at least 8 characters.', 400));
      user.password = newPassword;
      await user.save(); // triggers bcrypt pre-save hook
    }

    if (req.file) {
      const user = await User.findById(req.user._id);
      if (user.avatar && user.avatar.includes('cloudinary')) {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`saas-pm/avatars/${publicId}`).catch(() => {});
      }
      updateData.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
    return successResponse(res, 200, 'Profile updated.', { user });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name email avatar');
    if (!user) return next(new AppError('User not found.', 404));
    return successResponse(res, 200, 'User fetched.', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, updateProfile, getUserById };
