const express = require('express');
const router = express.Router();
const {
  register, sendOTP, verifyOTPHandler, login, googleLogin,
  refreshToken, forgotPassword, resetPassword, logout,
} = require('../controllers/authController');
const {
  validateRegister, validateLogin, validateSendOTP,
  validateVerifyOTP, validateForgotPassword, validateResetPassword,
} = require('../validators/authValidator');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 100 : 10,
  message: { success: false, message: 'Too many requests. Try again later.' },
});

const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 20 : 3,
  message: { success: false, message: 'Too many OTP requests. Try again in 1 minute.' },
});

router.post('/register', authLimiter, validateRegister, register);
router.post('/send-otp', otpLimiter, validateSendOTP, sendOTP);
router.post('/verify-otp', authLimiter, validateVerifyOTP, verifyOTPHandler);
router.post('/login', authLimiter, validateLogin, login);
router.post('/google-login', authLimiter, googleLogin);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', authLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password', authLimiter, validateResetPassword, resetPassword);
router.post('/logout', protect, logout);

module.exports = router;
