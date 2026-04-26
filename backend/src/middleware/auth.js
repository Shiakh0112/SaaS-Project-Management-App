const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password -otpHash -otpExpiry -refreshToken');

    if (!user) return next(new AppError('User not found.', 401));
    if (!user.isActive) return next(new AppError('Account is deactivated.', 403));

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please refresh.', 401));
    }
    return next(new AppError('Invalid token.', 401));
  }
};

module.exports = { protect, checkAuth: protect };
