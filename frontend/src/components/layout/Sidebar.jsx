import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiHome, FiFolder, FiUsers, FiBell, FiSettings,
  FiLogOut, FiSun, FiMoon, FiChevronLeft, FiChevronRight,
  FiCreditCard, FiGrid, FiExternalLink,
} from 'react-icons/fi';
import { logoutUser } from '../../app/slices/authSlice';
import Avatar from '../common/Avatar';
import useDarkMode from '../../hooks/useDarkMode';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);
  const { list: projects } = useSelector((s) => s.projects);
  const { isDark, toggle } = useDarkMode();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/projects', icon: FiFolder, label: 'Projects' },
    { to: '/teams', icon: FiUsers, label: 'Teams' },
    { to: '/notifications', icon: FiBell, label: 'Notifications', badge: unreadCount },
    { to: '/subscription', icon: FiCreditCard, label: 'Subscription' },
  ];

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 relative`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-sm z-10 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {collapsed ? <FiChevronRight size={12} /> : <FiChevronLeft size={12} />}
      </button>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-200 dark:border-gray-700 ${collapsed ? 'justify-center' : ''}`}>
        <button onClick={() => navigate('/')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiGrid className="text-white" size={16} />
          </div>
          {!collapsed && (
            <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">SaaS PM</span>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? label : ''}
          >
            <div className="relative flex-shrink-0">
              <Icon size={18} />
              {badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {/* Recent Projects */}
        {!collapsed && projects.length > 0 && (
          <div className="pt-4">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
              Recent Projects
            </p>
            {projects.slice(0, 5).map((project) => (
              <NavLink
                key={project._id}
                to={`/projects/${project._id}`}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color || '#6366f1' }}
                />
                <span className="truncate">{project.name}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className={`px-3 py-4 border-t border-gray-200 dark:border-gray-700 space-y-1`}>
        <button
          onClick={toggle}
          className={`sidebar-link w-full ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? (isDark ? 'Light Mode' : 'Dark Mode') : ''}
        >
          {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Settings' : ''}
        >
          <FiSettings size={18} />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={() => navigate('/')}
          className={`sidebar-link w-full ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Homepage' : ''}
        >
          <FiExternalLink size={18} />
          {!collapsed && <span>Homepage</span>}
        </button>

        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Logout' : ''}
        >
          <FiLogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* User */}
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mt-2 rounded-lg bg-gray-50 dark:bg-gray-800">
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
