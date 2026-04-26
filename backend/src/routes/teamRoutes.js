const express = require('express');
const router = express.Router();
const {
  createTeam, getMyTeams, getTeamById, inviteMember,
  acceptInvite, rejectInvite, updateMemberRole, removeMember,
} = require('../controllers/teamController');
const { protect } = require('../middleware/auth');
const { validateTeam, validateInvite, validateUpdateRole } = require('../validators/appValidator');

router.use(protect);

router.post('/create', validateTeam, createTeam);
router.get('/my-teams', getMyTeams);
router.get('/:teamId', getTeamById);
router.post('/invite', validateInvite, inviteMember);
router.post('/accept-invite', acceptInvite);
router.post('/reject-invite', rejectInvite);
router.put('/update-role/:teamId', validateUpdateRole, updateMemberRole);
router.delete('/remove-member/:teamId', removeMember);

module.exports = router;
