const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    attachments: [{ url: String, publicId: String, name: String }],
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    position: { type: Number, default: 0 },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['todo', 'in-progress', 'review', 'done'], default: 'todo' },
    dueDate: { type: Date },
    labels: [{ name: String, color: String }],
    attachments: [{ url: String, publicId: String, name: String, uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
    comments: [commentSchema],
    checklist: [{ title: String, isCompleted: { type: Boolean, default: false } }],
    isArchived: { type: Boolean, default: false },
    coverImage: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
