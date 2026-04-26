import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiSearch } from 'react-icons/fi';
import Avatar from '../common/Avatar';
import { PlanBadge } from '../common/Badge';

const Topbar = ({ title = '' }) => {
  const { user } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);
  const navigate = useNavigate();

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 w-56">
          <FiSearch size={14} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none w-full"
          />
        </div>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
        >
          <FiBell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User */}
        {user && (
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors"
          >
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-none">{user.name}</p>
              <div className="mt-0.5">
                <PlanBadge plan={user.subscription?.plan || 'free'} />
              </div>
            </div>
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
