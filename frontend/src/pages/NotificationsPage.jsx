import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiBell, FiCheck, FiCheckCircle, FiInfo, FiAlertCircle, FiUserPlus, FiMessageSquare, FiX, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markAsRead, markAllAsRead, acceptInvite, rejectInvite, deleteNotification, deleteAllNotifications } from '../app/slices/notificationSlice';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import { formatRelativeTime } from '../utils/helpers';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  task_assigned: FiCheckCircle,
  task_updated: FiInfo,
  comment: FiMessageSquare,
  team_invite: FiUserPlus,
  mention: FiAlertCircle,
  default: FiBell,
};

const TYPE_COLORS = {
  task_assigned: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  task_updated: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  comment: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  team_invite: 'text-primary-600 bg-primary-100 dark:bg-primary-900/30',
  mention: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  default: 'text-gray-600 bg-gray-100 dark:bg-gray-700',
};

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: notifications, unreadCount, loading } = useSelector((s) => s.notifications);

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  const handleMarkRead = async (id) => {
    await dispatch(markAsRead(id));
  };

  const handleMarkAll = async () => {
    await dispatch(markAllAsRead());
    toast.success('All notifications marked as read');
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await dispatch(deleteNotification(id));
  };

  const handleDeleteAll = async () => {
    await dispatch(deleteAllNotifications());
    toast.success('All notifications deleted');
  };

  const handleAccept = async (e, id) => {
    e.stopPropagation();
    const res = await dispatch(acceptInvite(id));
    if (!res.error) {
      toast.success('Invitation accepted! You joined the team.');
      navigate('/teams');
    } else {
      toast.error(res.payload || 'Failed to accept invite');
    }
  };

  const handleReject = async (e, id) => {
    e.stopPropagation();
    const res = await dispatch(rejectInvite(id));
    if (!res.error) toast.success('Invitation rejected.');
    else toast.error(res.payload || 'Failed to reject invite');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FiBell size={22} /> Notifications
            {unreadCount > 0 && (
              <span className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ml-1">{unreadCount} new</span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{notifications.length} total</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAll} className="btn-secondary gap-2">
              <FiCheck size={15} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={handleDeleteAll} className="btn-secondary gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
              <FiTrash2 size={15} /> Delete all
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : notifications.length === 0 ? (
        <div className="card p-16 text-center">
          <FiBell size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">All caught up!</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100 dark:divide-gray-700">
          {notifications.map((n) => {
            const Icon = TYPE_ICONS[n.type] || TYPE_ICONS.default;
            const colorCls = TYPE_COLORS[n.type] || TYPE_COLORS.default;
            return (
              <div
                key={n._id}
                className={`flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                onClick={() => !n.isRead && handleMarkRead(n._id)}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorCls}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm font-medium ${!n.isRead ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                        {n.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.isRead && <div className="w-2 h-2 bg-primary-600 rounded-full mt-1.5" />}
                      <button
                        onClick={(e) => handleDelete(e, n._id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete notification"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {n.sender && (
                      <div className="flex items-center gap-1.5">
                        <Avatar src={n.sender.avatar} name={n.sender.name || 'S'} size="xs" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{n.sender.name}</span>
                      </div>
                    )}
                    <span className="text-xs text-gray-400">{formatRelativeTime(n.createdAt)}</span>
                  </div>
                  {n.type === 'team_invite' && !n.metadata?.resolved && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => handleAccept(e, n._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <FiCheck size={12} /> Accept
                      </button>
                      <button
                        onClick={(e) => handleReject(e, n._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors"
                      >
                        <FiX size={12} /> Decline
                      </button>
                    </div>
                  )}
                  {n.type === 'team_invite' && n.metadata?.resolved && (
                    <p className="text-xs text-gray-400 mt-2 italic">Already responded</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
