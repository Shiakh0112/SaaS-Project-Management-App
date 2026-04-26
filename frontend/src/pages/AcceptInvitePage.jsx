import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { PageLoader } from '../components/common/Spinner';
import { FiGrid, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation link.');
      return;
    }

    // Agar logged in nahi hai toh login page pe bhejo, token preserve karke
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/invite/accept`, search: `?token=${token}` } }, replace: true });
      return;
    }

    const accept = async () => {
      try {
        const res = await api.post('/teams/accept-invite', { token });
        setTeamName(res.data.data.team.name);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Failed to accept invitation.');
      }
    };

    accept();
  }, [token, isAuthenticated]);

  if (status === 'loading') return <PageLoader />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FiGrid className="text-white" size={22} />
        </div>

        {status === 'success' ? (
          <div className="card p-8 space-y-4">
            <FiCheckCircle className="text-green-500 mx-auto" size={48} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">You're in!</h2>
            <p className="text-gray-500 dark:text-gray-400">
              You have successfully joined <strong>{teamName}</strong>.
            </p>
            <button onClick={() => navigate('/teams')} className="btn-primary w-full justify-center py-2.5">
              Go to Teams
            </button>
          </div>
        ) : (
          <div className="card p-8 space-y-4">
            <FiXCircle className="text-red-500 mx-auto" size={48} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Invitation Failed</h2>
            <p className="text-gray-500 dark:text-gray-400">{message}</p>
            <Link to="/dashboard" className="btn-primary w-full justify-center py-2.5 inline-flex">
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitePage;
