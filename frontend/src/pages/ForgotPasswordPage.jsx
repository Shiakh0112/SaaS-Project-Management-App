import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiMail, FiGrid, FiArrowLeft } from 'react-icons/fi';
import { forgotPassword, clearError } from '../app/slices/authSlice';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(forgotPassword({ email }));
    if (!res.error) setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <span>←</span> Back to Home
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FiGrid className="text-white" size={22} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Forgot password?</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">We'll send you a reset link</p>
        </div>

        <div className="card p-8">
          {error && <Alert type="error" message={error} onClose={() => dispatch(clearError())} />}

          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMail size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Check your inbox</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                We sent a password reset link to <strong>{email}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <FiMail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-9"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
                {loading ? <Spinner size="sm" /> : 'Send Reset Link'}
              </button>
            </form>
          )}

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary-600 mt-6 transition-colors">
            <FiArrowLeft size={14} /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
