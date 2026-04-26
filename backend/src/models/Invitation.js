const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true, lowercase: true },
    role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'expired'], default: 'pending' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Invitation', invitationSchema);
