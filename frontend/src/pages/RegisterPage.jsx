import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiGrid, FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { registerUser, sendOTP, verifyOTP, clearError, setRegisterEmail } from '../app/slices/authSlice';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

const STEPS = ['Register', 'Verify Email'];

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, registerEmail } = useSelector((s) => s.auth);

  const [step, setStep] = useState(() => registerEmail ? 1 : 0);

  useEffect(() => {
    if (registerEmail && step === 0) setStep(1);
  }, [registerEmail]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);

  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await dispatch(registerUser(form));
    if (!res.error) {
      const otpRes = await dispatch(sendOTP({ email: form.email }));
      if (!otpRes.error) {
        dispatch(setRegisterEmail(form.email));
        setStep(1);
        setResendTimer(60);
        toast.success('OTP sent to your email!');
      } else {
        toast.error(otpRes.payload || 'Failed to send OTP');
      }
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return toast.error('Enter the 6-digit OTP');
    const res = await dispatch(verifyOTP({ email: registerEmail || form.email, otp: code }));
    if (!res.error) {
      toast.success('Account verified! Welcome 🎉');
      navigate('/dashboard');
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    const res = await dispatch(sendOTP({ email: registerEmail || form.email }));
    if (!res.error) {
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      toast.success('New OTP sent!');
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

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FiGrid className="text-white" size={22} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {step === 0 ? 'Create your account' : 'Verify your email'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {step === 0 ? 'Start managing projects today' : `We sent a 6-digit code to ${registerEmail || form.email}`}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i <= step ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                {i + 1}
              </div>
              <span className={`text-xs font-medium ${i === step ? 'text-primary-600' : 'text-gray-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        <div className="card p-8">
          {error && <Alert type="error" message={error} onClose={() => dispatch(clearError())} />}

          {step === 0 ? (
            <form onSubmit={handleRegister} className="space-y-4 mt-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <FiUser size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input pl-9"
                    placeholder="John Doe"
                    required
                    minLength={2}
                  />
                </div>
              </div>

              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <FiMail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input pl-9"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
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
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
                {loading ? <Spinner size="sm" /> : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6 mt-4">
              {/* OTP inputs */}
              <div className="flex justify-center gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-12 text-center text-lg font-bold border-2 rounded-xl focus:outline-none focus:border-primary-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 transition-colors"
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <button type="submit" disabled={loading || otp.join('').length < 6} className="btn-primary w-full justify-center py-2.5">
                {loading ? <Spinner size="sm" /> : 'Verify & Continue'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || loading}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
