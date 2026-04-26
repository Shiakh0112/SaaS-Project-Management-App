import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiLock, FiGrid, FiEye, FiEyeOff } from 'react-icons/fi';
import { resetPassword, clearError } from '../app/slices/authSlice';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (!token) return toast.error('Invalid or expired reset link');
    const res = await dispatch(resetPassword({ token, password: form.password }));
    if (!res.error) {
      toast.success('Password reset successfully!');
      navigate('/login');
    }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reset password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your new password below</p>
        </div>

        <div className="card p-8">
          {error && <Alert type="error" message={error} onClose={() => dispatch(clearError())} />}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <FiLock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input pl-9 pr-10"
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <FiLock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="input pl-9"
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? <Spinner size="sm" /> : 'Reset Password'}
            </button>
          </form>

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary-600 mt-6 transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
