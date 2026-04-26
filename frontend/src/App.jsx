import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import ProtectedRoute, { PublicRoute } from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import { PageLoader } from './components/common/Spinner';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import BoardPage from './pages/BoardPage';
import TeamsPage from './pages/TeamsPage';
import NotificationsPage from './pages/NotificationsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SettingsPage from './pages/SettingsPage';
import AcceptInvitePage from './pages/AcceptInvitePage';

const App = () => {
  const { loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <Routes>
      {/* Landing — accessible to everyone, logged in or not */}
      <Route path="/" element={<LandingPage />} />

      {/* Public */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
      <Route path="/invite/accept" element={<AcceptInvitePage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/projects/:projectId/boards/:boardId" element={<BoardPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
