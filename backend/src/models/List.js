const mongoose = require('mongoose');

const listSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    position: { type: Number, required: true, default: 0 },
    color: { type: String, default: '#e2e8f0' },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('List', listSchema);
