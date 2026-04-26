const Notification = require('../models/Notification');
const Invitation = require('../models/Invitation');
const Team = require('../models/Team');
const { successResponse } = require('../utils/response');
const AppError = require('../utils/AppError');
const { createNotification } = require('../services/notificationService');

// GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user._id })
        .populate('sender', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ recipient: req.user._id }),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    return successResponse(res, 200, 'Notifications fetched.', {
      notifications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notifications/read/:id
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
      return successResponse(res, 200, 'All notifications marked as read.');
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return next(new AppError('Notification not found.', 404));

    return successResponse(res, 200, 'Notification marked as read.', { notification });
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications/:id/accept-invite
const acceptInviteFromNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
    if (!notification) return next(new AppError('Notification not found.', 404));
    if (notification.type !== 'team_invite') return next(new AppError('Not an invite notification.', 400));

    const { invitationToken } = notification.metadata || {};
    if (!invitationToken) return next(new AppError('Invalid invitation.', 400));

    const invitation = await Invitation.findOne({ token: invitationToken, status: 'pending' }).populate('team invitedBy');
    if (!invitation) return next(new AppError('Invitation expired or already used.', 400));
    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      return next(new AppError('Invitation has expired.', 400));
    }

    const team = await Team.findById(invitation.team._id);
    const alreadyMember = team.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!alreadyMember) {
      team.members.push({ user: req.user._id, role: invitation.role });
      await team.save();
    }

    invitation.status = 'accepted';
    await invitation.save();

    // Mark notification as read
    notification.isRead = true;
    await notification.save();

    // Notify inviter
    await createNotification({
      recipient: invitation.invitedBy._id,
      sender: req.user._id,
      type: 'team_invite_accepted',
      title: 'Invitation Accepted',
      message: `${req.user.name} accepted your invitation to join ${team.name}.`,
      link: `/teams`,
    });

    return successResponse(res, 200, 'Invitation accepted.', { team });
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications/:id/reject-invite
const rejectInviteFromNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
    if (!notification) return next(new AppError('Notification not found.', 404));
    if (notification.type !== 'team_invite') return next(new AppError('Not an invite notification.', 400));

    const { invitationToken } = notification.metadata || {};
    if (!invitationToken) return next(new AppError('Invalid invitation.', 400));

    const invitation = await Invitation.findOne({ token: invitationToken, status: 'pending' }).populate('invitedBy team');
    if (invitation) {
      invitation.status = 'rejected';
      await invitation.save();

      await createNotification({
        recipient: invitation.invitedBy._id,
        sender: req.user._id,
        type: 'team_invite_rejected',
        title: 'Invitation Rejected',
        message: `${req.user.name} rejected your invitation to join ${invitation.team.name}.`,
      });
    }

    notification.isRead = true;
    await notification.save();

    return successResponse(res, 200, 'Invitation rejected.');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({ _id: id, recipient: req.user._id });
    if (!notification) return next(new AppError('Notification not found.', 404));
    return successResponse(res, 200, 'Notification deleted.');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notifications/delete/all
const deleteAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    return successResponse(res, 200, 'All notifications deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, deleteNotification, deleteAllNotifications, acceptInviteFromNotification, rejectInviteFromNotification };
