const List = require('../models/List');
const Task = require('../models/Task');
const { successResponse } = require('../utils/response');
const AppError = require('../utils/AppError');

// GET /api/lists/board/:boardId
const getListsByBoard = async (req, res, next) => {
  try {
    const lists = await List.find({ board: req.params.boardId, isArchived: false }).sort({ position: 1 });
    return successResponse(res, 200, 'Lists fetched.', { lists });
  } catch (error) {
    next(error);
  }
};

// POST /api/lists/create
const createList = async (req, res, next) => {
  try {
    const { name, boardId, color } = req.body;

    const lastList = await List.findOne({ board: boardId }).sort({ position: -1 });
    const position = lastList ? lastList.position + 1 : 0;

    const list = await List.create({ name, board: boardId, position, color });
    return successResponse(res, 201, 'List created.', { list });
  } catch (error) {
    next(error);
  }
};

// PUT /api/lists/update/:listId
const updateList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.listId);
    if (!list) return next(new AppError('List not found.', 404));

    const { name, position, color, isArchived } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (position !== undefined) updateData.position = position;
    if (color) updateData.color = color;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    const updated = await List.findByIdAndUpdate(req.params.listId, updateData, { new: true });
    return successResponse(res, 200, 'List updated.', { list: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/lists/delete/:listId
const deleteList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.listId);
    if (!list) return next(new AppError('List not found.', 404));

    await Task.deleteMany({ list: req.params.listId });
    await List.findByIdAndDelete(req.params.listId);

    return successResponse(res, 200, 'List deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = { createList, updateList, deleteList, getListsByBoard };
