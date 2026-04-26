const Task = require('../models/Task');
const List = require('../models/List');
const { successResponse } = require('../utils/response');
const AppError = require('../utils/AppError');
const { createNotification } = require('../services/notificationService');

let io;
const setIO = (socketIO) => { io = socketIO; };

// POST /api/tasks/create
const createTask = async (req, res, next) => {
  try {
    const { title, description, listId, boardId, projectId, priority, dueDate, assignees } = req.body;

    const lastTask = await Task.findOne({ list: listId }).sort({ position: -1 });
    const position = lastTask ? lastTask.position + 1 : 0;

    const task = await Task.create({
      title, description, list: listId, board: boardId, project: projectId,
      createdBy: req.user._id, priority, dueDate, assignees: assignees || [], position,
    });

    const populated = await Task.findById(task._id)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('list', 'name position');

    // Notify assignees
    if (assignees && assignees.length > 0) {
      for (const assigneeId of assignees) {
        if (assigneeId !== req.user._id.toString()) {
          await createNotification({
            recipient: assigneeId,
            sender: req.user._id,
            type: 'task_assigned',
            title: 'Task Assigned',
            message: `${req.user.name} assigned you to "${title}"`,
            link: `/boards/${boardId}`,
            metadata: { taskId: task._id },
          });
        }
      }
    }

    if (io) io.to(`board:${boardId}`).emit('task:created', populated);
    return successResponse(res, 201, 'Task created.', { task: populated });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:boardId
const getTasksByBoard = async (req, res, next) => {
  try {
    const tasks = await Task.find({ board: req.params.boardId, isArchived: false })
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.user', 'name email avatar')
      .populate('list', 'name position')
      .sort({ position: 1 });
    return successResponse(res, 200, 'Tasks fetched.', { tasks });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/update/:taskId
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return next(new AppError('Task not found.', 404));

    const { title, description, priority, status, dueDate, assignees, labels, checklist, isArchived, coverImage, attachments } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (assignees) updateData.assignees = assignees;
    if (labels) updateData.labels = labels;
    if (checklist) updateData.checklist = checklist;
    if (isArchived !== undefined) updateData.isArchived = isArchived;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (attachments !== undefined) updateData.attachments = attachments;
    if (req.file) updateData.coverImage = req.file.path;

    const updated = await Task.findByIdAndUpdate(req.params.taskId, updateData, { new: true })
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.user', 'name email avatar')
      .populate('list', 'name position');

    if (io) io.to(`board:${task.board.toString()}`).emit('task:updated', updated);
    return successResponse(res, 200, 'Task updated.', { task: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/delete/:taskId
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return next(new AppError('Task not found.', 404));

    await Task.findByIdAndDelete(req.params.taskId);
    if (io) io.to(`board:${task.board.toString()}`).emit('task:deleted', { taskId: req.params.taskId });
    return successResponse(res, 200, 'Task deleted.');
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/move/:taskId
const moveTask = async (req, res, next) => {
  try {
    const { listId, position } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) return next(new AppError('Task not found.', 404));

    const list = await List.findById(listId);
    if (!list) return next(new AppError('List not found.', 404));

    // Reorder tasks in destination list
    await Task.updateMany(
      { list: listId, position: { $gte: position }, _id: { $ne: task._id } },
      { $inc: { position: 1 } }
    );

    task.list = listId;
    task.position = position;
    await task.save();

    const updated = await Task.findById(task._id)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('list', 'name position');

    if (io) io.to(`board:${task.board.toString()}`).emit('task:moved', updated);
    return successResponse(res, 200, 'Task moved.', { task: updated });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks/comment/:taskId
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) return next(new AppError('Task not found.', 404));

    const comment = { user: req.user._id, content };
    if (req.file) comment.attachments = [{ url: req.file.path, name: req.file.originalname }];

    task.comments.push(comment);
    await task.save();

    const updated = await Task.findById(task._id)
      .populate('comments.user', 'name email avatar')
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('list', 'name position');

    // Notify task creator and assignees
    const notifyUsers = [...task.assignees.map((a) => a._id ? a._id.toString() : a.toString()), task.createdBy.toString()]
      .filter((id, idx, arr) => arr.indexOf(id) === idx && id !== req.user._id.toString());

    for (const userId of notifyUsers) {
      await createNotification({
        recipient: userId,
        sender: req.user._id,
        type: 'task_commented',
        title: 'New Comment',
        message: `${req.user.name} commented on "${task.title}"`,
        link: `/boards/${task.board}`,
        metadata: { taskId: task._id },
      });
    }

    if (io) io.to(`board:${task.board.toString()}`).emit('task:commented', updated);
    return successResponse(res, 201, 'Comment added.', { task: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasksByBoard, updateTask, deleteTask, moveTask, addComment, setIO };
