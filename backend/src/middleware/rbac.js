const Team = require('../models/Team');
const Project = require('../models/Project');
const AppError = require('../utils/AppError');

// Check if user has required role in a team
const requireTeamRole = (...roles) => async (req, res, next) => {
  try {
    const teamId = req.params.teamId || req.body.teamId;
    if (!teamId) return next(new AppError('Team ID required.', 400));

    const team = await Team.findById(teamId);
    if (!team) return next(new AppError('Team not found.', 404));

    const member = team.members.find((m) => m.user.toString() === req.user._id.toString());
    const isOwner = team.owner.toString() === req.user._id.toString();

    if (!isOwner && !member) return next(new AppError('You are not a member of this team.', 403));

    const userRole = isOwner ? 'owner' : member.role;
    if (!roles.includes(userRole) && userRole !== 'owner') {
      return next(new AppError(`Access denied. Required role: ${roles.join(' or ')}.`, 403));
    }

    req.team = team;
    req.userTeamRole = userRole;
    next();
  } catch (error) {
    next(error);
  }
};

// Check if user is project member
const requireProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.projectId;
    if (!projectId) return next(new AppError('Project ID required.', 400));

    const project = await Project.findById(projectId);
    if (!project) return next(new AppError('Project not found.', 404));

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some((m) => m.toString() === req.user._id.toString());

    if (!isOwner && !isMember) {
      return next(new AppError('Access denied to this project.', 403));
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

// Admin only
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required.', 403));
  }
  next();
};

module.exports = { requireTeamRole, requireProjectAccess, adminOnly, checkAuth: requireTeamRole, checkRole: requireTeamRole };
