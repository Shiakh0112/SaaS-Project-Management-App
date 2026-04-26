const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOTP = async (otp) => {
  return bcrypt.hash(otp, 10);
};

const verifyOTP = async (plainOTP, hashedOTP) => {
  return bcrypt.compare(plainOTP, hashedOTP);
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const getOTPExpiry = () => {
  const minutes = parseInt(process.env.OTP_EXPIRES_IN) || 10;
  return new Date(Date.now() + minutes * 60 * 1000);
};

module.exports = { generateOTP, hashOTP, verifyOTP, generateResetToken, getOTPExpiry };
