const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'member', 'viewer'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
});

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    avatar: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [memberSchema],
    slug: { type: String, unique: true },
  },
  { timestamps: true }
);

teamSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Team', teamSchema);
