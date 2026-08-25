import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Sparkles, Feather, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
];

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, login, register } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);

  // Synchronize when opened with a specific mode
  React.useEffect(() => {
    setMode(authModalMode);
    setErrorMessage('');
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMessage('Please fill in both email/username and password');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await login(identifier, password);
      showToast('Welcome back to Chronicle!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !name || !email || !password) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await register({
        username,
        name,
        email,
        password,
        bio,
        avatar: selectedAvatar,
      });
      showToast('Welcome to Chronicle! Your account is ready.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (emailToUse: string) => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await login(emailToUse, 'password123');
      showToast(`Signed in as ${emailToUse}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Quick login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-stone-50 text-stone-900 rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-200/80 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-50 flex items-center justify-center font-serif font-bold text-lg shadow-sm">
                C
              </div>
              <span className="font-serif font-semibold text-lg tracking-tight text-stone-900">Chronicle</span>
            </div>
            <button
              id="auth-modal-close-btn"
              onClick={closeAuthModal}
              className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-stone-200 bg-stone-100/70 p-1 mx-6 mt-4 rounded-xl">
            <button
              id="tab-login-btn"
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-register-btn"
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Scrollable Form Content */}
          <div className="p-6 overflow-y-auto space-y-5">
            {/* Quick Demo Access Bar */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-semibold mb-1 text-amber-950">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Instant Demo Login (1-Click Test Accounts):</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('alex@example.com')}
                  disabled={isSubmitting}
                  className="px-2 py-1.5 rounded-lg bg-white border border-amber-200 text-stone-800 hover:border-amber-400 hover:bg-amber-100/50 text-left transition-colors truncate font-medium disabled:opacity-50 shadow-2xs"
                >
                  <span className="block font-semibold truncate">Alex Rivera</span>
                  <span className="text-[10px] text-stone-500 block truncate">Staff Engineer</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('sarah@example.com')}
                  disabled={isSubmitting}
                  className="px-2 py-1.5 rounded-lg bg-white border border-amber-200 text-stone-800 hover:border-amber-400 hover:bg-amber-100/50 text-left transition-colors truncate font-medium disabled:opacity-50 shadow-2xs"
                >
                  <span className="block font-semibold truncate">Sarah Chen</span>
                  <span className="text-[10px] text-stone-500 block truncate">Designer</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('david@example.com')}
                  disabled={isSubmitting}
                  className="px-2 py-1.5 rounded-lg bg-white border border-amber-200 text-stone-800 hover:border-amber-400 hover:bg-amber-100/50 text-left transition-colors truncate font-medium disabled:opacity-50 shadow-2xs"
                >
                  <span className="block font-semibold truncate">David Kim</span>
                  <span className="text-[10px] text-stone-500 block truncate">Architect</span>
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <span className="font-semibold">Error:</span> {errorMessage}
              </div>
            )}

            {mode === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Email or Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-identifier-input"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="alex@example.com or alexdev"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[11px] text-stone-500">Default demo password: password123</span>
                  </div>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <span className="inline-block animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <span>Sign In to Chronicle</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      id="register-name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Elena Vance"
                      required
                      className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Username *
                    </label>
                    <input
                      id="register-username-input"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="elenav"
                      required
                      className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="register-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="elena@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Password (min 6 chars) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="register-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Short Bio (Optional)
                  </label>
                  <textarea
                    id="register-bio-input"
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Writer, designer, software engineer..."
                    className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Choose Profile Avatar
                  </label>
                  <div className="flex items-center gap-2.5">
                    {AVATAR_PRESETS.map((avatarUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(avatarUrl)}
                        className={`relative rounded-full p-0.5 transition-all ${
                          selectedAvatar === avatarUrl ? 'ring-2 ring-stone-900 ring-offset-2 scale-105' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={avatarUrl}
                          alt={`Avatar option ${idx + 1}`}
                          className="w-10 h-10 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  id="register-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 mt-4"
                >
                  {isSubmitting ? (
                    <span className="inline-block animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <span>Create Account & Start Writing</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
