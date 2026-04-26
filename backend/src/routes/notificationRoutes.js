const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, deleteNotification, deleteAllNotifications, acceptInviteFromNotification, rejectInviteFromNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getNotifications);
router.put('/read/:id', markAsRead);
router.delete('/delete/all', deleteAllNotifications);
router.delete('/:id', deleteNotification);
router.post('/:id/accept-invite', acceptInviteFromNotification);
router.post('/:id/reject-invite', rejectInviteFromNotification);

module.exports = router;
