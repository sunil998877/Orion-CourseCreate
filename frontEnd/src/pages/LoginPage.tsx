import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AnimatedBackground from './AnimatedBg';
import HeroImage from '../assests/avatar.png';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { API_BASE } from '../utils/api';

function App() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Modal State: 'none', 'forgot', 'reset'
  const [modalMode, setModalMode] = useState<'none' | 'forgot' | 'reset'>('none');

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotIsLoading, setForgotIsLoading] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Reset password form state
  const [resetData, setResetData] = useState({
    email: '',
    token: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [resetIsLoading, setResetIsLoading] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Check URL query parameters on mount to auto-trigger Reset Password Modal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    if (token && email) {
      setResetData({
        email: email,
        token: token,
        newPassword: '',
        confirmPassword: ''
      });
      setModalMode('reset');
      // Clean up search parameters so they don't linger in URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate opacity based on scroll position
      const scrollY = window.scrollY;
      const opacity = Math.max(0.3, 1 - scrollY * 0.001);
      setScrollOpacity(opacity);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        // Clear potential stale avatar from previous session
        localStorage.removeItem('avatar');
        if (data.username) {
          localStorage.setItem('username', data.username);
        }
        if (data.email) {
          localStorage.setItem('email', data.email);
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success('Login successful!...');
        navigate('/course-creator', { replace: true });
      }
      else {
        setErrors({
          general: data.message || 'Login failed. Please check your credentials.',
          email: data.errors?.email,
        })
      }
    } catch {
      setErrors({
        general: 'An error occurred. Please try again later.',
      });
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotError('Please enter a valid email address');
      return;
    }

    setForgotIsLoading(true);
    setForgotError('');
    setForgotSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success('Reset code generated successfully!');
        setForgotSuccessMessage(data.message || 'Reset link sent successfully!');
        setResetData(prev => ({ ...prev, email: forgotEmail }));
      } else {
        setForgotError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setForgotError('An error occurred. Please try again later.');
    } finally {
      setForgotIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, token, newPassword, confirmPassword } = resetData;

    if (!email || !token || !newPassword || !confirmPassword) {
      setResetError('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    setResetIsLoading(true);
    setResetError('');
    setResetSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset successful! Please log in.');
        setResetSuccessMessage(data.message || 'Password reset successful!');

        // Reset states
        setResetData({ email: '', token: '', newPassword: '', confirmPassword: '' });

        // Close modal
        setTimeout(() => {
          setModalMode('none');
          setResetSuccessMessage('');
        }, 2500);
      } else {
        setResetError(data.message || 'Invalid or expired token.');
      }
    } catch {
      setResetError('An error occurred. Please try again later.');
    } finally {
      setResetIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-auto animate-fade-in">
        <AnimatedBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-8" style={{ opacity: scrollOpacity, transition: 'opacity 0.3s ease' }}>
          <div className="w-full max-w-4xl">
            <div className="flex flex-col gap-8 items-center">
              <div className="w-full">
                <div className="mt-3 rounded-2xl bg-black shadow-2xl ring-1 ring-white/5 transition-transform duration-300 hover:shadow-2xl border border-white/5 flex flex-col md:flex-row">
                  <div className="flex md:w-2/5 w-full items-center justify-center p-6">
                    <img src={HeroImage} alt="Avatar" className="max-w-[300px] max-h-[300px] md:max-w-[220px] md:max-h-[220px] w-auto h-auto rounded-xl object-contain" />
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-5 p-6 md:w-3/5 w-full">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                      <p className="text-sm text-white/70">Sign in to continue to your account.</p>
                    </div>
                    {errors.general && (
                      <div className="rounded-md bg-red-500/20 p-4 border border-red-500/50">
                        <div className="flex">
                          <div className="text-sm text-red-200">{errors.general}</div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white">
                        Email address
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Mail size={18} />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className={`
                      block w-full rounded-lg border bg-black px-3 py-2.5 pl-10 shadow-sm text-white placeholder:text-gray-700
                      transition-all duration-200
                      focus:border-white/10 focus:outline-none focus:ring-1 focus:ring-white/5
                      ${errors.email ? 'border-red-500' : 'border-white/3'}
                    `}
                          placeholder="you@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1.5 text-sm text-red-300">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Lock size={18} />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className={`
                      block w-full rounded-lg border bg-black px-3 py-2.5 pl-10 pr-10 shadow-sm text-white placeholder:text-gray-700
                      transition-all duration-200
                      focus:border-white/10 focus:outline-none focus:ring-1 focus:ring-white/5
                      ${errors.password ? 'border-red-500' : 'border-white/3'}
                    `}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1.5 text-sm text-red-300">{errors.password}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          checked={formData.rememberMe}
                          onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                          className="h-4 w-4 rounded border-white/3 text-white focus:ring-white/5 bg-black"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                          Remember me
                        </label>
                      </div>

                      <div className="text-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setForgotEmail(formData.email); // prefill with whatever is in the email input currently
                            setForgotError('');
                            setForgotSuccessMessage('');
                            setModalMode('forgot');
                          }}
                          className="font-medium text-white/70 hover:text-white transition-colors focus:outline-none"
                        >
                          Forgot password?
                        </button>
                      </div>
                    </div>
                    <div className="w-full mt-6 flex items-center justify-center">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`
                    relative sm:w-[200px] md:w-[220px] lg:w-[240px] rounded-lg
                    bg-gradient-to-r from-lime-400 to-emerald-500
                    px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200
                    hover:from-lime-300 hover:to-emerald-400
                    focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 disabled:opacity-50
                `}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <span className="mr-2 inline-block h-4 w-1 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"></span>
                            Signing in...
                          </span>
                        ) : (
                          'Sign in to Dashboard'
                        )}
                      </button>
                    </div>

                    <div className="text-center text-sm text-white/50 mt-6">
                      <span>New to our platform?</span>
                    </div>

                    <div className="text-center">
                      <a
                        href="/registration"
                        className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                        Create a new account
                      </a>
                    </div>
                  </form>
                </div>

                <div className="mt-4 text-center text-xs text-white/50">
                  By signing in, you agree to our{' '}
                  <a href="#" className="font-medium text-white/70 hover:text-white transition-colors">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="font-medium text-white/70 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Modal Backdrop and Card */}
        {modalMode !== 'none' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in transition-all duration-300">
            <div className="relative w-full max-w-md rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl p-6 md:p-8 animate-scale-in">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setModalMode('none')}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>

              {modalMode === 'forgot' ? (
                <form onSubmit={handleForgotSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">Reset Password</h3>
                    <p className="text-sm text-white/70">Enter your email and we'll generate a 6-digit secure OTP code.</p>
                  </div>

                  {forgotError && (
                    <div className="rounded-md bg-red-500/10 p-3 border border-red-500/30 text-sm text-red-200">
                      {forgotError}
                    </div>
                  )}

                  {forgotSuccessMessage && (
                    <div className="rounded-md bg-emerald-500/10 p-3 border border-emerald-500/30 text-sm text-emerald-200">
                      {forgotSuccessMessage}
                    </div>
                  )}

                  <div>
                    <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-white/80">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Mail size={18} />
                      </div>
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="block w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 pl-10 shadow-sm text-white placeholder:text-gray-700 focus:border-lime-500/50 focus:outline-none focus:ring-1 focus:ring-lime-500/30 transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotIsLoading}
                    className="w-full rounded-lg bg-gradient-to-r from-lime-400 to-emerald-500 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-lime-300 hover:to-emerald-400 disabled:opacity-50 font-semibold"
                  >
                    {forgotIsLoading ? 'Generating Reset Token...' : 'Generate Reset Token'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setResetError('');
                        setResetSuccessMessage('');
                        setModalMode('reset');
                      }}
                      className="text-xs text-lime-400 hover:text-lime-300 transition-colors underline"
                    >
                      Already have a 6-digit OTP code? Click here
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">Set New Password</h3>
                    <p className="text-xs text-white/70">Enter your email, 6-digit OTP code, and the new password below.</p>
                  </div>

                  {resetError && (
                    <div className="rounded-md bg-red-500/10 p-3 border border-red-500/30 text-sm text-red-200">
                      {resetError}
                    </div>
                  )}

                  {resetSuccessMessage && (
                    <div className="rounded-md bg-emerald-500/10 p-3 border border-emerald-500/30 text-sm text-emerald-200">
                      {resetSuccessMessage}
                    </div>
                  )}

                  <div>
                    <label htmlFor="reset-email" className="mb-1 block text-xs font-medium text-white/80">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Mail size={16} />
                      </div>
                      <input
                        id="reset-email"
                        type="email"
                        required
                        value={resetData.email}
                        onChange={(e) => setResetData(prev => ({ ...prev, email: e.target.value }))}
                        className="block w-full rounded-lg border border-white/10 bg-black px-3 py-2 pl-10 text-white placeholder:text-gray-700 focus:border-lime-500/50 focus:outline-none focus:ring-1 focus:ring-lime-500/30"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reset-token" className="mb-1 block text-xs font-medium text-white/80">
                      6-Digit OTP Code
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Lock size={16} />
                      </div>
                      <input
                        id="reset-token"
                        type="text"
                        required
                        value={resetData.token}
                        onChange={(e) => setResetData(prev => ({ ...prev, token: e.target.value }))}
                        className="block w-full rounded-lg border border-white/10 bg-black px-3 py-2 pl-10 text-white placeholder:text-gray-700 focus:border-lime-500/50 focus:outline-none focus:ring-1 focus:ring-lime-500/30"
                        placeholder="Enter 6-digit OTP code"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reset-new-password" className="mb-1 block text-xs font-medium text-white/80">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Lock size={16} />
                      </div>
                      <input
                        id="reset-new-password"
                        type={showResetPassword ? 'text' : 'password'}
                        required
                        value={resetData.newPassword}
                        onChange={(e) => setResetData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="block w-full rounded-lg border border-white/10 bg-black px-3 py-2 pl-10 pr-10 text-white placeholder:text-gray-700 focus:border-lime-500/50 focus:outline-none focus:ring-1 focus:ring-lime-500/30"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      >
                        {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reset-confirm-password" className="mb-1 block text-xs font-medium text-white/80">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Lock size={16} />
                      </div>
                      <input
                        id="reset-confirm-password"
                        type={showResetPassword ? 'text' : 'password'}
                        required
                        value={resetData.confirmPassword}
                        onChange={(e) => setResetData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="block w-full rounded-lg border border-white/10 bg-black px-3 py-2 pl-10 pr-10 text-white placeholder:text-gray-700 focus:border-lime-500/50 focus:outline-none focus:ring-1 focus:ring-lime-500/30"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetIsLoading}
                    className="w-full rounded-lg bg-gradient-to-r from-lime-400 to-emerald-500 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-lime-300 hover:to-emerald-400 disabled:opacity-50 mt-2"
                  >
                    {resetIsLoading ? 'Resetting Password...' : 'Reset Password'}
                  </button>

                  <div className="text-center mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotError('');
                        setForgotSuccessMessage('');
                        setModalMode('forgot');
                      }}
                      className="text-xs text-white/50 hover:text-white transition-colors"
                    >
                      ← Back to Request Reset Code
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default App;
