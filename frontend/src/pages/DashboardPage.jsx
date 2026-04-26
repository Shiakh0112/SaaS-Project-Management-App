import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiFolder, FiUsers, FiCheckSquare, FiBell, FiPlus, FiArrowRight, FiTrendingUp, FiSun, FiSunrise, FiMoon, FiBarChart2, FiLock, FiPieChart } from 'react-icons/fi';
import { fetchProjects } from '../app/slices/projectSlice';
import { fetchMyTeams } from '../app/slices/teamSlice';
import { fetchNotifications } from '../app/slices/notificationSlice';
import Avatar from '../components/common/Avatar';
import { formatRelativeTime, isOverdue, isDueSoon } from '../utils/helpers';
import { PriorityBadge } from '../components/common/Badge';
import Spinner from '../components/common/Spinner';

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to} className="card p-5 hover:shadow-md transition-shadow group">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <FiArrowRight size={16} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
  </Link>
);

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { list: projects, loading: projLoading } = useSelector((s) => s.projects);
  const { list: teams } = useSelector((s) => s.teams);
  const { list: notifications, unreadCount } = useSelector((s) => s.notifications);
  const { list: tasks } = useSelector((s) => s.tasks);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchMyTeams());
    dispatch(fetchNotifications({ limit: 5 }));
  }, [dispatch]);

  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate) && t.status !== 'done');
  const dueSoonTasks = tasks.filter((t) => isDueSoon(t.dueDate) && t.status !== 'done');

  const canAnalytics = ['pro', 'enterprise'].includes(user?.subscription?.plan);

  // Analytics data
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const highPriority = tasks.filter((t) => ['high', 'urgent'].includes(t.priority) && t.status !== 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const GreetIcon = hour < 12 ? FiSunrise : hour < 17 ? FiSun : FiMoon;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Avatar src={user?.avatar} name={user?.name} size="md" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {greeting}, {user?.name?.split(' ')[0]}!
              <GreetIcon size={22} className={hour < 12 ? 'text-orange-400' : hour < 17 ? 'text-yellow-400' : 'text-indigo-400'} />
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Here's what's happening today</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiFolder} label="Total Projects" value={projects.length} color="bg-primary-500" to="/projects" />
        <StatCard icon={FiUsers} label="Teams" value={teams.length} color="bg-purple-500" to="/teams" />
        <StatCard icon={FiCheckSquare} label="Active Tasks" value={tasks.filter((t) => t.status !== 'done').length} color="bg-green-500" to="/projects" />
        <StatCard icon={FiBell} label="Unread Alerts" value={unreadCount} color="bg-orange-500" to="/notifications" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FiFolder size={16} className="text-primary-600" /> Recent Projects
            </h2>
            <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View all <FiArrowRight size={14} />
            </Link>
          </div>

          {projLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <FiFolder size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No projects yet</p>
              <Link to="/projects" className="btn-primary inline-flex mt-3 text-sm">
                <FiPlus size={14} /> Create Project
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: project.color || '#6366f1' }}
                  >
                    {project.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 transition-colors">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{project.description || 'No description'}</p>
                  </div>
                  <div className="flex -space-x-1.5">
                    {project.members?.slice(0, 3).map((m, i) => (
                      <Avatar key={i} src={m.avatar} name={m.name || 'U'} size="xs" className="ring-2 ring-white dark:ring-gray-800" />
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FiBell size={16} className="text-orange-500" /> Notifications
                {unreadCount > 0 && (
                  <span className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{unreadCount}</span>
                )}
              </h2>
              <Link to="/notifications" className="text-xs text-primary-600 hover:text-primary-700 font-medium">View all</Link>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No notifications</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 4).map((n) => (
                  <div key={n._id} className={`flex gap-3 p-2 rounded-lg ${!n.isRead ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                    <Avatar src={n.sender?.avatar} name={n.sender?.name || 'S'} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-1" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className="card p-5 border-red-200 dark:border-red-800">
              <h2 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 mb-3">
                <FiTrendingUp size={16} /> Overdue Tasks ({overdueTasks.length})
              </h2>
              <div className="space-y-2">
                {overdueTasks.slice(0, 3).map((t) => (
                  <div key={t._id} className="flex items-center gap-2">
                    <PriorityBadge priority={t.priority} />
                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics */}
          {canAnalytics ? (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                <FiBarChart2 size={16} className="text-primary-600" /> Analytics
              </h2>
              <div className="space-y-3">
                {/* Completion Rate */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Completion Rate</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
                  </div>
                </div>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { label: 'Total Tasks',   value: totalTasks,      color: 'text-gray-700 dark:text-gray-300' },
                    { label: 'Completed',     value: doneTasks,       color: 'text-green-600' },
                    { label: 'In Progress',   value: inProgressTasks, color: 'text-blue-600' },
                    { label: 'High Priority', value: highPriority,    color: 'text-red-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2.5 text-center">
                      <p className={`text-lg font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-5 border-dashed">
              <div className="text-center">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FiLock size={18} className="text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Analytics</p>
                <p className="text-xs text-gray-400 mb-3">Upgrade to Pro to unlock task analytics and insights.</p>
                <Link to="/subscription" className="btn-primary text-xs py-1.5 px-3 inline-flex">
                  <FiBarChart2 size={12} /> Upgrade to Pro
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
