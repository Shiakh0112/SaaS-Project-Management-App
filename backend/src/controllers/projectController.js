const Project = require('../models/Project');
const Team = require('../models/Team');
const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');
const { successResponse } = require('../utils/response');
const AppError = require('../utils/AppError');

// POST /api/projects/create
const createProject = async (req, res, next) => {
  try {
    const { name, description, teamId, color, visibility, dueDate } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return next(new AppError('Team not found.', 404));

    const isMember = team.members.some((m) => m.user.toString() === req.user._id.toString());
    const isOwner = team.owner.toString() === req.user._id.toString();
    if (!isMember && !isOwner) return next(new AppError('You are not a member of this team.', 403));

    const project = await Project.create({
      name, description, team: teamId, owner: req.user._id,
      members: [req.user._id], color, visibility, dueDate,
    });

    return successResponse(res, 201, 'Project created.', { project });
  } catch (error) {
    next(error);
  }
};

// GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
      status: { $ne: 'archived' },
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate('team', 'name');
    return successResponse(res, 200, 'Projects fetched.', { projects });
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:projectId
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate('team', 'name');
    if (!project) return next(new AppError('Project not found.', 404));

    const isMember = project.members.some((m) => m._id.toString() === req.user._id.toString());
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    if (!isMember && !isOwner) return next(new AppError('Access denied.', 403));

    return successResponse(res, 200, 'Project fetched.', { project });
  } catch (error) {
    next(error);
  }
};

// PUT /api/projects/update/:projectId
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return next(new AppError('Project not found.', 404));
    if (project.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Only project owner can update.', 403));
    }

    const { name, description, color, status, visibility, dueDate } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color) updateData.color = color;
    if (status) updateData.status = status;
    if (visibility) updateData.visibility = visibility;
    if (dueDate) updateData.dueDate = dueDate;
    if (req.file) updateData.cover = req.file.path;

    const updated = await Project.findByIdAndUpdate(req.params.projectId, updateData, { new: true });
    return successResponse(res, 200, 'Project updated.', { project: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/delete/:projectId
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return next(new AppError('Project not found.', 404));
    if (project.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Only project owner can delete.', 403));
    }

    const boards = await Board.find({ project: req.params.projectId });
    const boardIds = boards.map((b) => b._id);
    await Task.deleteMany({ board: { $in: boardIds } });
    await List.deleteMany({ board: { $in: boardIds } });
    await Board.deleteMany({ project: req.params.projectId });
    await Project.findByIdAndDelete(req.params.projectId);
    return successResponse(res, 200, 'Project deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject };
