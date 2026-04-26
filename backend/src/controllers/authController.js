const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { generateOTP, hashOTP, verifyOTP, generateResetToken, getOTPExpiry } = require('../utils/otp');
const { sendOTPEmail, sendPasswordResetEmail } = require('../services/emailService');
const { successResponse, errorResponse } = require('../utils/response');
const AppError = require('../utils/AppError');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return next(new AppError('Email already registered.', 409));
    }

    if (existingUser && !existingUser.isVerified) {
      // Update existing unverified user
      existingUser.name = name;
      existingUser.password = password;
      await existingUser.save();
      return successResponse(res, 201, 'Registered. Please verify your email.', { email });
    }

    await User.create({ name, email, password });
    return successResponse(res, 201, 'Registered. Please verify your email.', { email });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/send-otp
const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select('+otpHash +otpExpiry +otpAttempts +otpLastSent');
    if (!user) return next(new AppError('User not found.', 404));
    if (user.isVerified) return next(new AppError('Email already verified.', 400));

    // Rate limit: 1 OTP per minute
    if (user.otpLastSent && Date.now() - user.otpLastSent.getTime() < 60 * 1000) {
      return next(new AppError('Please wait 1 minute before requesting a new OTP.', 429));
    }

    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);

    user.otpHash = hashedOtp;
    user.otpExpiry = getOTPExpiry();
    user.otpAttempts = 0;
    user.otpLastSent = new Date();
    await user.save();

    await sendOTPEmail(email, otp, user.name);
    return successResponse(res, 200, 'OTP sent to your email.');
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/verify-otp
const verifyOTPHandler = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+otpHash +otpExpiry +otpAttempts');
    if (!user) return next(new AppError('User not found.', 404));
    if (user.isVerified) return next(new AppError('Email already verified.', 400));

    if (user.otpAttempts >= 5) {
      return next(new AppError('Too many failed attempts. Request a new OTP.', 429));
    }

    if (!user.otpHash || !user.otpExpiry || user.otpExpiry < new Date()) {
      return next(new AppError('OTP expired. Please request a new one.', 400));
    }

    const isValid = await verifyOTP(otp, user.otpHash);
    if (!isValid) {
      user.otpAttempts += 1;
      await user.save();
      return next(new AppError('Invalid OTP.', 400));
    }

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    await user.save();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    const userData = { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role, subscription: user.subscription };
    return successResponse(res, 200, 'Email verified successfully.', { accessToken, refreshToken, user: userData });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !user.password) return next(new AppError('Invalid credentials.', 401));
    if (!user.isVerified) return next(new AppError('Please verify your email first.', 403));
    if (!user.isActive) return next(new AppError('Account deactivated.', 403));

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(new AppError('Invalid credentials.', 401));

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    const userData = { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role, subscription: user.subscription };
    return successResponse(res, 200, 'Login successful.', { accessToken, refreshToken, user: userData });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/google-login
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return next(new AppError('Google ID token required.', 400));

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId }, { email }] }).select('+refreshToken');

    if (!user) {
      user = await User.create({ name, email, googleId, avatar: picture, isVerified: true });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatar) user.avatar = picture;
      user.isVerified = true;
      await user.save();
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    const userData = { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role, subscription: user.subscription };
    return successResponse(res, 200, 'Google login successful.', { accessToken, refreshToken, user: userData });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/refresh-token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return next(new AppError('Refresh token required.', 400));

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return next(new AppError('Invalid refresh token.', 401));
    }

    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();

    return successResponse(res, 200, 'Token refreshed.', { accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError') return next(new AppError('Refresh token expired. Please login again.', 401));
    next(error);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return successResponse(res, 200, 'If this email exists, a reset link has been sent.');

    const resetToken = generateResetToken();
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(email, user.name, resetUrl);

    return successResponse(res, 200, 'Password reset link sent to your email.');
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpiry');

    if (!user) return next(new AppError('Invalid or expired reset token.', 400));

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return successResponse(res, 200, 'Password reset successful. Please login.');
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+refreshToken');
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    return successResponse(res, 200, 'Logged out successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, sendOTP, verifyOTPHandler, login, googleLogin, refreshToken, forgotPassword, resetPassword, logout };
