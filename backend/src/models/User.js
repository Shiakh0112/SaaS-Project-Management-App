const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    avatar: { type: String, default: '' },
    googleId: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // OTP fields
    otpHash: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    otpLastSent: { type: Date, select: false },

    // Password reset
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpiry: { type: Date, select: false },

    // Refresh token
    refreshToken: { type: String, select: false },

    // Subscription
    subscription: {
      plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
      status: { type: String, enum: ['active', 'inactive', 'cancelled'], default: 'active' },
      expiresAt: { type: Date },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
