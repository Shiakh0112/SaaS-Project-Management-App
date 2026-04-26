const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, message: 'Validation error', errors });
  }
  next();
};

// Team
const teamSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
});

const inviteSchema = Joi.object({
  teamId: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'member', 'viewer').default('member'),
});

const updateRoleSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.string().valid('admin', 'member', 'viewer').required(),
});

// Project
const projectSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(1000).optional(),
  teamId: Joi.string().required(),
  color: Joi.string().optional(),
  visibility: Joi.string().valid('private', 'team', 'public').optional(),
  dueDate: Joi.date().optional(),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(1000).optional(),
  color: Joi.string().optional(),
  status: Joi.string().valid('active', 'archived', 'completed').optional(),
  visibility: Joi.string().valid('private', 'team', 'public').optional(),
  dueDate: Joi.date().optional(),
});

// Board
const boardSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  projectId: Joi.string().required(),
  background: Joi.string().optional(),
});

// List
const listSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  boardId: Joi.string().required(),
  position: Joi.number().optional(),
  color: Joi.string().optional(),
});

// Task
const taskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(5000).optional(),
  listId: Joi.string().required(),
  boardId: Joi.string().required(),
  projectId: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  dueDate: Joi.date().optional(),
  assignees: Joi.array().items(Joi.string()).optional(),
});

const commentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
});

module.exports = {
  validateTeam: validate(teamSchema),
  validateInvite: validate(inviteSchema),
  validateUpdateRole: validate(updateRoleSchema),
  validateProject: validate(projectSchema),
  validateUpdateProject: validate(updateProjectSchema),
  validateBoard: validate(boardSchema),
  validateList: validate(listSchema),
  validateTask: validate(taskSchema),
  validateComment: validate(commentSchema),
};
