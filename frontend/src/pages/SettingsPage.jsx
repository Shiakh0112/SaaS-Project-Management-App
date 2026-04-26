import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiUser, FiMail, FiCamera, FiSave, FiLock, FiEye, FiEyeOff, FiSun, FiMoon } from 'react-icons/fi';
import { updateProfile, clearError, fetchMe } from '../app/slices/authSlice';
import { uploadAvatar } from '../services/uploadService';
import Avatar from '../components/common/Avatar';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';
import { PlanBadge } from '../components/common/Badge';
import useDarkMode from '../hooks/useDarkMode';
import toast from 'react-hot-toast';
import api from '../services/api';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((s) => s.auth);
  const { isDark, toggle } = useDarkMode();
  const fileRef = useRef(null);

  const [profile, setProfile] = useState({ name: '', email: '' });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (user) setProfile({ name: user.name || '', email: user.email || '' });
  }, [user]);

  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      await uploadAvatar(file);
      await dispatch(fetchMe());
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const res = await dispatch(updateProfile({ name: profile.name }));
    if (!res.error) toast.success('Profile updated!');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setPwLoading(true);
    try {
      await api.put('/users/update-profile', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
          <FiUser size={16} className="text-primary-600" /> Profile
        </h2>

        {error && <Alert type="error" message={error} onClose={() => dispatch(clearError())} />}

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <Avatar src={user?.avatar} name={user?.name || 'U'} size="xl" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
            >
              {avatarUploading ? <Spinner size="sm" /> : <FiCamera size={13} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <div className="mt-1">
              <PlanBadge plan={user?.subscription?.plan || 'free'} />
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <FiUser size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="input pl-9"
                placeholder="Your name"
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <FiMail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={profile.email} className="input pl-9 opacity-60 cursor-not-allowed" disabled />
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Spinner size="sm" /> : <><FiSave size={15} /> Save Changes</>}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
          <FiLock size={16} className="text-primary-600" /> Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {['currentPassword', 'newPassword', 'confirm'].map((field) => (
            <div key={field}>
              <label className="label capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <div className="relative">
                <FiLock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwForm[field]}
                  onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
                  className="input pl-9 pr-10"
                  placeholder="••••••••"
                  required
                  minLength={field !== 'currentPassword' ? 8 : 1}
                />
                {field === 'confirm' && (
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="submit" disabled={pwLoading} className="btn-primary">
            {pwLoading ? <Spinner size="sm" /> : <><FiLock size={15} /> Update Password</>}
          </button>
        </form>
      </div>

      {/* Appearance */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          {isDark ? <FiMoon size={16} className="text-primary-600" /> : <FiSun size={16} className="text-primary-600" />}
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
          </div>
          <button
            onClick={toggle}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isDark ? 'bg-primary-600' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
