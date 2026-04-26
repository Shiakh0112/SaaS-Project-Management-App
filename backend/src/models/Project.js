const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    cover: { type: String, default: '' },
    color: { type: String, default: '#6366f1' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['active', 'archived', 'completed'], default: 'active' },
    visibility: { type: String, enum: ['private', 'team', 'public'], default: 'team' },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
