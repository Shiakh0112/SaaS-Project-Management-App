const Team = require('../models/Team');
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const { successResponse } = require('../utils/response');
const AppError = require('../utils/AppError');
const { createNotification } = require('../services/notificationService');
const { v4: uuidv4 } = require('uuid');

// POST /api/teams/create
const createTeam = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const team = await Team.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
    });
    return successResponse(res, 201, 'Team created.', { team });
  } catch (error) {
    next(error);
  }
};

// GET /api/teams/my-teams
const getMyTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    }).populate('owner', 'name email avatar').populate('members.user', 'name email avatar');
    return successResponse(res, 200, 'Teams fetched.', { teams });
  } catch (error) {
    next(error);
  }
};

// GET /api/teams/:teamId
const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
    if (!team) return next(new AppError('Team not found.', 404));
    return successResponse(res, 200, 'Team fetched.', { team });
  } catch (error) {
    next(error);
  }
};

// POST /api/teams/invite
const inviteMember = async (req, res, next) => {
  try {
    const { teamId, email, role } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return next(new AppError('Team not found.', 404));

    // Check if inviter is owner or admin
    const isOwner = team.owner.toString() === req.user._id.toString();
    const member = team.members.find((m) => m.user.toString() === req.user._id.toString());
    if (!isOwner && (!member || !['admin'].includes(member.role))) {
      return next(new AppError('Only owner or admin can invite members.', 403));
    }

    // Check if user already a member
    const invitedUser = await User.findOne({ email });
    if (invitedUser) {
      const alreadyMember = team.members.some((m) => m.user.toString() === invitedUser._id.toString());
      if (alreadyMember) return next(new AppError('User is already a team member.', 400));
    }

    // Check for existing pending invite
    const existingInvite = await Invitation.findOne({ team: teamId, email, status: 'pending' });
    if (existingInvite) return next(new AppError('Invitation already sent to this email.', 400));

    const token = uuidv4();
    const invitation = await Invitation.create({
      team: teamId,
      invitedBy: req.user._id,
      email,
      role: role || 'member',
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Send in-app notification instead of email
    if (invitedUser) {
      await createNotification({
        recipient: invitedUser._id,
        sender: req.user._id,
        type: 'team_invite',
        title: 'Team Invitation',
        message: `${req.user.name} invited you to join ${team.name}.`,
        link: '/notifications',
        metadata: { invitationToken: token, teamId, teamName: team.name, role: role || 'member' },
      });
      return successResponse(res, 200, 'Invitation sent.', { invitation });
    }

    return successResponse(res, 200, 'Invitation created. User is not registered yet — they must register with this email to receive the invite.', { invitation });
  } catch (error) {
    next(error);
  }
};

// POST /api/teams/accept-invite
const acceptInvite = async (req, res, next) => {
  try {
    const { token } = req.body;

    const invitation = await Invitation.findOne({ token, status: 'pending' }).populate('team invitedBy');
    if (!invitation) return next(new AppError('Invalid or expired invitation.', 400));
    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      return next(new AppError('Invitation has expired.', 400));
    }

    if (invitation.email !== req.user.email) {
      return next(new AppError('This invitation is not for your account.', 403));
    }

    const team = await Team.findById(invitation.team._id);
    const alreadyMember = team.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!alreadyMember) {
      team.members.push({ user: req.user._id, role: invitation.role });
      await team.save();
    }

    invitation.status = 'accepted';
    await invitation.save();

    await createNotification({
      recipient: invitation.invitedBy._id,
      sender: req.user._id,
      type: 'team_invite_accepted',
      title: 'Invitation Accepted',
      message: `${req.user.name} accepted your invitation to join ${team.name}.`,
      link: `/teams/${team._id}`,
    });

    return successResponse(res, 200, 'Invitation accepted.', { team });
  } catch (error) {
    next(error);
  }
};

// POST /api/teams/reject-invite
const rejectInvite = async (req, res, next) => {
  try {
    const { token } = req.body;

    const invitation = await Invitation.findOne({ token, status: 'pending' }).populate('invitedBy team');
    if (!invitation) return next(new AppError('Invalid invitation.', 400));

    invitation.status = 'rejected';
    await invitation.save();

    await createNotification({
      recipient: invitation.invitedBy._id,
      sender: req.user._id,
      type: 'team_invite_rejected',
      title: 'Invitation Rejected',
      message: `${req.user.name} rejected your invitation to join ${invitation.team.name}.`,
    });

    return successResponse(res, 200, 'Invitation rejected.');
  } catch (error) {
    next(error);
  }
};

// PUT /api/teams/update-role/:teamId
const updateMemberRole = async (req, res, next) => {
  try {
    const teamId = req.params.teamId;
    const { userId, role } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return next(new AppError('Team not found.', 404));

    if (team.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Only team owner can update roles.', 403));
    }

    if (userId === req.user._id.toString()) {
      return next(new AppError('Cannot change your own role.', 400));
    }

    const member = team.members.find((m) => m.user.toString() === userId);
    if (!member) return next(new AppError('Member not found.', 404));

    member.role = role;
    await team.save();

    return successResponse(res, 200, 'Role updated.', { team });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/teams/remove-member/:teamId
const removeMember = async (req, res, next) => {
  try {
    const teamId = req.params.teamId;
    const { userId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return next(new AppError('Team not found.', 404));

    const isOwner = team.owner.toString() === req.user._id.toString();
    const isAdmin = team.members.find((m) => m.user.toString() === req.user._id.toString() && m.role === 'admin');

    if (!isOwner && !isAdmin) return next(new AppError('Insufficient permissions.', 403));
    if (userId === team.owner.toString()) return next(new AppError('Cannot remove team owner.', 400));

    team.members = team.members.filter((m) => m.user.toString() !== userId);
    await team.save();

    return successResponse(res, 200, 'Member removed.');
  } catch (error) {
    next(error);
  }
};

module.exports = { createTeam, getMyTeams, getTeamById, inviteMember, acceptInvite, rejectInvite, updateMemberRole, removeMember };
