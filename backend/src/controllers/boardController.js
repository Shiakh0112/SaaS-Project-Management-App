const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { successResponse } = require('../utils/response');
const AppError = require('../utils/AppError');

// POST /api/boards/create
const createBoard = async (req, res, next) => {
  try {
    const { name, description, projectId, background } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return next(new AppError('Project not found.', 404));

    const isMember = project.members.some((m) => m.toString() === req.user._id.toString());
    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isMember && !isOwner) return next(new AppError('Access denied.', 403));

    const board = await Board.create({ name, description, project: projectId, createdBy: req.user._id, background });
    return successResponse(res, 201, 'Board created.', { board });
  } catch (error) {
    next(error);
  }
};

// GET /api/boards/:projectId
const getBoardsByProject = async (req, res, next) => {
  try {
    const boards = await Board.find({ project: req.params.projectId, isArchived: false })
      .populate('createdBy', 'name email avatar');
    return successResponse(res, 200, 'Boards fetched.', { boards });
  } catch (error) {
    next(error);
  }
};

// PUT /api/boards/update/:boardId
const updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) return next(new AppError('Board not found.', 404));

    const { name, description, background, isArchived } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (background) updateData.background = background;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    const updated = await Board.findByIdAndUpdate(req.params.boardId, updateData, { new: true });
    return successResponse(res, 200, 'Board updated.', { board: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/boards/delete/:boardId
const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) return next(new AppError('Board not found.', 404));

    await List.deleteMany({ board: req.params.boardId });
    await Task.deleteMany({ board: req.params.boardId });
    await Board.findByIdAndDelete(req.params.boardId);

    return successResponse(res, 200, 'Board deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = { createBoard, getBoardsByProject, updateBoard, deleteBoard };
